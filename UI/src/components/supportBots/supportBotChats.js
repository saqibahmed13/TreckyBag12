import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, CircularProgress, Paper, TextField, Chip, Stack } from "@mui/material";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API from "../../utils/api.service";
import bgImage from "../../assets/chatSupport.jpg";

const WEBSOCKET_TEXT_URL = "https://emtcas-emt-itexp-d2-wa-ngxp-poc.azurewebsites.net";
let sessionId = null;

const LoadingDots = () => {
    return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {[...Array(3)].map((_, i) => (
                <motion.span
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0,
                        delay: i * 0.2
                    }}
                    style={{ margin: '0 1px' }}
                >
                    .
                </motion.span>
            ))}
        </Box>
    );
};

const SupportBotChats = (props) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ws, setWs] = useState(null);
    const [incomingMsg, setincomingMsg] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const lastMessageRef = useRef(null);
    const inputRef = useRef(null);


    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [messages]);

    useEffect(() => {
        if (!isProcessing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isProcessing]);


    const sendMessage = () => {
        if (!incomingMsg.trim() || isProcessing) return;

        const message = incomingMsg.trim();
        setMessages((prev) => [...prev, { text: message, sender: "user" }]);
        setincomingMsg("");

        setIsProcessing(true);
        setMessages((prev) => [...prev, { text: "Processing your request", sender: "bot", isProcessing: true }]);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            setLoading(true);
        }

        if (!sessionId) createSessionId();

        const data = {
            query: message,
            session_id: sessionId,
            user_email: props.userEmail,
            service: "it_service_center"
        };

        const baseUrl = WEBSOCKET_TEXT_URL.endsWith('/')
            ? WEBSOCKET_TEXT_URL
            : WEBSOCKET_TEXT_URL + '/';

        API.ChatSupportItsc(
            baseUrl,
            `wstext/`,
            data,
            (response) => {
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    { text: response.data.toString(), sender: "bot" }
                ]);
                setLoading(false);
                setIsProcessing(false);
            },
            (error) => {
                setLoading(false);
                setIsProcessing(false);
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    {
                        text: "Sorry, there was an error processing your request",
                        sender: "bot"
                    }
                ]);
            }
        );
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && !event.shiftKey && !isProcessing) {
            event.preventDefault();
            sendMessage();
        }
    };

    const createSessionId = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");
        const second = String(now.getSeconds()).padStart(2, "0");
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const newSessionId = `${year}${month}-${day}${hour}-${minute}${second}-${randomPart}`;
        sessionId = newSessionId;
    }

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
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, backgroundColor: "#efe160", maxWidth: "70%", width: "50%", zIndex: 2, padding: "5px" }}>
                <Typography variant="h5" gutterBottom sx={{ textAlign: "center", fontWeight: "bold", color: "#00000", fontSize: "12px" }}>
                    Viatris Chat Assistant for IT Support
                </Typography>
                <Box sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    padding: "2px",
                    backgroundColor: "white",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }}>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                display: "flex",
                                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                                width: "100%",
                            }}
                            ref={index === messages.length - 1 ? lastMessageRef : null}
                        >
                            <Typography
                                sx={{
                                    textAlign: msg.sender === "user" ? "right" : "left",
                                    backgroundColor: msg.sender === "user" ? "#356e8a" : "#6dd6cc",
                                    color: msg.sender === "user" ? "white" : "black",
                                    borderRadius: 1,
                                    fontSize: "12px",
                                    maxWidth: "90%",
                                    padding: "2px",
                                    display: "inline-block",
                                    fontStyle: msg.isProcessing ? "italic" : "normal",
                                    opacity: msg.isProcessing ? 0.8 : 1,
                                    wordBreak: "break-word",
                                }}
                            >
                                <b>{msg.sender === "user" ? "You " : "AI Agent "}: </b>
                                {msg.isProcessing ? (
                                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                        Processing your request
                                        <LoadingDots />
                                        <CircularProgress
                                            size={12}
                                            thickness={5}
                                            sx={{
                                                ml: 1,
                                                color: msg.sender === "user" ? "white" : "black",
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => <span {...props} />,
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'inherit', textDecoration: 'underline' }}
                                                >
                                                    {props.children}
                                                </a>
                                            ),
                                            code: ({ node, ...props }) => (
                                                <code
                                                    style={{
                                                        backgroundColor: '#eee',
                                                        padding: '1px 2px',
                                                        borderRadius: '2px',
                                                        display: 'block',
                                                        overflowX: 'auto',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        maxWidth: '100%',
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px',
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

                                )}
                            </Typography>
                        </motion.div>
                    ))}
                </Box>
                {loading && <CircularProgress size={24} sx={{ display: "block", mx: "auto", mb: 2 }} />}
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    variant="outlined"
                    placeholder={isProcessing ? "Please wait..." : "Type a message for IT Support..."}
                    value={incomingMsg}
                    onChange={(e) => setincomingMsg(e.target.value)}
                    onKeyPress={handleKeyPress}
                    multiline
                    minRows={1}
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 2,
                        '& .MuiInputBase-root': {
                            opacity: isProcessing ? 0.7 : 1,
                            paddingY: '5px',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            fontWeight: 'normal',
                            color: isProcessing ? '#008000' : '#888',
                        },
                    }}
                    disabled={isProcessing}
                />
            </Paper>
        </Box>
    );
};

export default SupportBotChats;