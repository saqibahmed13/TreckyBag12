import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    Box,
    Typography,
    CircularProgress,
    Paper,
    IconButton,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import "./supportBot.css";
import bgImage from "../../assets/voiceAssistant.png";

const SupportBotVoices = (props) => {
    const [isListening, setIsListening] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ws, setWs] = useState(null);
    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioRef = useRef(null);
    const streamRef = useRef(null);
    const lastMessageRef = useRef(null);
    const isPausedRef = useRef(false);
    const WEBSOCKET_URL = `wss://emtcas-emt-itexp-d2-wa-ngxp-poc.azurewebsites.net/ws?user_email=${encodeURIComponent(
        props.userEmail
    )}`;

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";
            recognition.onresult = (event) => {
                if (isPausedRef.current) return;
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
            };
            recognition.onend = () => {
                if (isListening && !isPausedRef.current) {
                    recognition.start();
                }
            };
            recognitionRef.current = recognition;
        }
    }, []);

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [messages]);


    const tryParseJSON = (rawText) => {
        try {
            return JSON.parse(rawText);
        } catch (e1) {
            try {
                if (rawText.startsWith("{") && rawText.endsWith("}")) {
                    let fixedJson = rawText
                        .replace(/(?<!\\)'/g, '"')
                        .replace(/\\'/g, "'")
                        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
                        .replace(/"([^"]*)":\s*"(?:')([^"]*?)(?:')"/g, '"$1":"$2"')
                        .replace(/"([^"]*)":\s*'(.*?)'/g, '"$1":"$2"');
                    return JSON.parse(fixedJson);
                }
                const maybeJSON = rawText.match(/{.*}/s)?.[0];
                if (maybeJSON) {
                    let fixedJson = maybeJSON
                        .replace(/(?<!\\)'/g, '"')
                        .replace(/\\'/g, "'")
                        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
                        .replace(/"([^"]*)":\s*'(.*?)'/g, '"$1":"$2"');
                    return JSON.parse(fixedJson);
                }
            } catch (e2) {
                console.error("Failed to parse message as JSON:", rawText);
                return null;
            }
        }
        return null;
    };

    const startListening = async () => {
        if (!recognitionRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            const websocket = new WebSocket(WEBSOCKET_URL);
            websocket.onopen = () => {
                console.log("WebSocket connection opened.");
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0 && websocket.readyState === WebSocket.OPEN && !isPausedRef.current) {
                        websocket.send(e.data);
                    }
                };
                mediaRecorder.start(100);
            };

            websocket.onmessage = async (event) => {
                if (event.data instanceof Blob) {
                    const audioUrl = URL.createObjectURL(event.data);
                    if (audioRef.current) {
                        audioRef.current.src = audioUrl;
                        audioRef.current.play().catch((err) => console.warn("Audio play failed: ", err));
                    }
                    return;
                }

                try {
                    const rawText = event.data.toString().trim();
                    console.log("Raw message received:", rawText);
                    let parsed = tryParseJSON(rawText);
                    if (!parsed && rawText) {
                        const simpleMatch = rawText.match(/\s*{\s*'?([\w_]+)'?\s*:\s*'?(.*?)'?\s*}\s*/);
                        if (simpleMatch) {
                            parsed = { [simpleMatch[1]]: simpleMatch[2] };
                        } else {
                            setMessages((prev) => {
                                const updated = [...prev];
                                const loadingIndex = updated.findIndex((msg) => msg.isLoading);
                                if (loadingIndex !== -1) {
                                    updated[loadingIndex] = { sender: "bot", text: rawText };
                                } else {
                                    updated.push({ sender: "bot", text: rawText });
                                }
                                return updated;
                            });
                            setLoading(false);
                            return;
                        }
                    }

                    const botResponse = parsed?.ai_response || parsed?.ai_reponse || (typeof parsed === 'string' ? parsed : null);
                    if (botResponse) {
                        const cleanResponse = botResponse.replace(/^'+|'+$/g, '');
                        setMessages((prev) => {
                            const updated = [...prev];
                            const loadingIndex = updated.findIndex((msg) => msg.isLoading);
                            if (loadingIndex !== -1) {
                                updated[loadingIndex] = { sender: "bot", text: cleanResponse };
                            } else {
                                updated.push({ sender: "bot", text: cleanResponse });
                            }
                            return updated;
                        });
                    }
                    const userResponse = parsed?.user_input || parsed?.user_input || (typeof parsed === 'string' ? parsed : null);
                    if (userResponse) {
                        const cleanUserResponse = userResponse.replace(/^'+|'+$/g, '');
                        setMessages((prev) => [
                            ...prev,
                            { sender: "user", text: cleanUserResponse },
                            { sender: "bot", text: "Processing your request...", isLoading: true },
                        ]);
                        setLoading(true);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Error processing message:", error);
                    setLoading(false);
                }
            };
            websocket.onclose = () => {
                console.warn("WebSocket closed");
                if (isListening) {
                    setTimeout(startListening, 1000);
                }
            };

            setWs(websocket);
            mediaRecorderRef.current = mediaRecorder;
            recognitionRef.current.start();
            setIsListening(true);
            isPausedRef.current = false;
            setIsPaused(false);
        } catch (error) {
            console.error("Microphone access error:", error);
        }
    };




    const stopListening = () => {
        setIsListening(false);
        setIsPaused(false);
        isPausedRef.current = false;
        recognitionRef.current?.stop();
        mediaRecorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        ws?.close();
        setWs(null);
    };

    const pauseListening = () => {
        isPausedRef.current = true;
        setIsPaused(true);
    };

    const resumeListening = () => {
        isPausedRef.current = false;
        setIsPaused(false);
    };

    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: `url(${bgImage})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                backgroundSize: "cover",
                overflow: "hidden",
            }}
        >
            {isListening && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100vh",
                        background: "rgb(142 239 7 / 30%)",
                        bottom: 0,
                    }}
                />
            )}

            <Paper
                elevation={4}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: "#d401f9",
                    maxWidth: "80%",
                    width: "60%",
                    zIndex: 2,
                    padding: "10px",
                }}
            >
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#ffffff;",
                        fontSize: "12px",
                    }}
                >
                    Viatris Voice Assistant for IT Support
                </Typography>

                <Box
                    sx={{
                        maxHeight: 300,
                        overflowY: "auto",
                        padding: "2px",
                        backgroundColor: "white",
                        borderRadius: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                    }}
                >
                    {messages.map((msg, index) => {
                        const senderLabel = msg.sender === "user" ? "You " : "AI Agent ";
                        const isLoading = msg.isLoading;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: senderLabel === "You " ? 50 : -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    display: "flex",
                                    justifyContent: senderLabel === "You " ? "flex-end" : "flex-start",
                                    width: "100%",
                                }}
                                ref={index === messages.length - 1 ? lastMessageRef : null}
                            >
                                <Typography
                                    sx={{
                                        textAlign: senderLabel === "You " ? "right" : "left",
                                        backgroundColor: senderLabel === "You " ? "#356e8a" : "#6dd6cc",
                                        color: senderLabel === "You " ? "white" : "black",
                                        borderRadius: 1,
                                        fontSize: "12px",
                                        maxWidth: "75%",
                                        padding: "5px",
                                        display: "inline-block",
                                        wordBreak: "break-word",
                                        whiteSpace: "pre-wrap",
                                        "& a": {
                                            color: senderLabel === "You " ? "#bde0fe" : "#004080",
                                            textDecoration: "underline",
                                        },
                                        "& code": {
                                            backgroundColor: "#e0e0e0",
                                            padding: "2px 4px",
                                            borderRadius: "4px",
                                            fontFamily: "monospace",
                                        },
                                    }}
                                >
                                    <b>{senderLabel}:</b>{" "}
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => <span {...props} />, // inline instead of <p>
                                            a: ({ node, ...props }) => (
                                                <a
                                                    style={{ color: 'inherit', textDecoration: 'underline' }}
                                                    {...props}
                                                />
                                            ),
                                            code: ({ node, ...props }) => (
                                                <code
                                                    style={{
                                                        backgroundColor: '#eee',
                                                        padding: '1px 2px',
                                                        borderRadius: '2px',
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul
                                                    style={{
                                                        listStylePosition: 'inside',
                                                        margin: 0,
                                                        paddingLeft: '1rem',
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol
                                                    style={{
                                                        listStylePosition: 'inside',
                                                        margin: 0,
                                                        paddingLeft: '1rem',
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            li: ({ node, ...props }) => (
                                                <li style={{ display: 'list-item' }}>{props.children}</li>
                                            ),
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>

                                    {isLoading && (
                                        <CircularProgress size={14} sx={{ ml: 1, color: "black" }} />
                                    )}
                                </Typography>
                            </motion.div>
                        );
                    })}

                </Box>

                <Box display="flex" justifyContent="center" gap={1} alignItems="center" marginTop="10px">
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: 1,
                            backgroundColor: "#efe160",
                            textTransform: "capitalize",
                            fontSize: "10px",
                            color: "#000000"
                        }}
                        startIcon={isListening ? <StopIcon /> : <MicIcon />}
                        onClick={isListening ? stopListening : startListening}
                    >
                        {isListening ? "Stop Conversation" : "Chat with Assistant"}
                    </Button>

                    {isListening && !isPaused && (

                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: 1,
                                backgroundColor: "green",
                                textTransform: "capitalize",
                                fontSize: "10px",
                                color: "#fff"
                            }}
                            startIcon={<PauseCircleIcon fontSize="small" />}
                            onClick={pauseListening}
                        >
                            Mute
                        </Button>
                    )}

                    {isPaused && (

                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: 1,
                                backgroundColor: "red",
                                textTransform: "capitalize",
                                fontSize: "10px",
                                color: "#fff"
                            }}
                            startIcon={<PlayCircleIcon fontSize="small" />}
                            onClick={resumeListening}
                        >
                            Unmute
                        </Button>
                    )}
                </Box>
            </Paper>

            <audio ref={audioRef} style={{ display: "none" }} />
        </Box>
    );
};

export default SupportBotVoices;