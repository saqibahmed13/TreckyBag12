import React, { useEffect } from 'react';
import './sdlcChat.css';
import API from '../../utils/api.service';
import { Box } from '@mui/material';
import background from '../../assets/Viatris_Gradient_Light_RGB2.png';
import send from '../../assets/paper-airplane.png';
import start_chat from '../../assets/start_chat.png';
import SdlcPrompt from './sdlcPrompt';
import SdlcOutgoing from './sdlcOutgoing';
import SdlcIncoming from './sdlcIncoming';
import SdlcUploadMessage from './sdlcUploadMessage';
import Files from 'react-files';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function SDLCChat(props) {
    const [message, setMessage] = React.useState([]);
    const [loadView, setLoadView] = React.useState(false);
    const [showPrompt, setShowPrompt] = React.useState(true);
    const [promptQuest, setPromptQuest] = React.useState("");
    const [docInfo, setDocInfo] = React.useState(false);
    const [blobURL, setBlobURL] = React.useState("");
    const [enableSubmit, setEnableSubmit] = React.useState(true);
    const [disableEdit, setDisableEdit] = React.useState(true);
    const [disableUpload, setDisableUpload] = React.useState(true);

    const sessionChatPath = `${props.baseURL}/chat/${props.sessionID}`;
    const path = `chat/${props.sessionID}?user_email=${props.user_email}`;

    const user = props.userName();

    useEffect(() => {
        setPromptQuest(props.promptQuest);
    }, [props.promptQuest]);

    const onKeyUp = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (enableSubmit) {
                submit();
            }
        }
    };

    const onKeyDown = (e) => {
        const inputValue = e.target.value.trim();
        setEnableSubmit(inputValue.length > 0);
    };

    const submit = async () => {
        await postAnswer();
    }

    const getQuestion = (answer, docGenerationConfirmation, fileData) => {
        let humanAnswer = '';
        let generateDoc = false;
        answer ? humanAnswer = answer : humanAnswer = null;
        if (docGenerationConfirmation) {
            generateDoc = docGenerationConfirmation;
            humanAnswer = JSON.stringify(JSON.stringify(docInfo));
        }
        let fileContent = '';
        fileData ? fileContent = fileData : fileContent = null;

        const formData = new FormData();
        formData.append('user_email', props.user_email);
        formData.append('session_id', props.sessionID);
        formData.append('domain', props.domain);
        formData.append('human', humanAnswer);
        formData.append('document_generation', generateDoc);
        formData.append('file_content', fileContent);

        return new Promise((resolve, reject) => {
            API.POST(
                props.baseURL,
                'document_analyse_create/',
                formData,
                (response) => {
                    console.log("document_analyse_create response:", response.data);
                    resolve(response.data);
                },
                (error) => {
                    console.error("Error from document_analyse_create:", error);
                    reject(error);
                }
            );
        });
    }

    const downloadDocument = async () => {
        try {
            props.loaded(false);

            const formData = new FormData();
            formData.append("blob_url", blobURL);
            formData.append("user_email", props.user_email);
            formData.append("session_id", props.sessionID);
            formData.append("domain", props.domain);

            const response = await API.POST(
                props.baseURL,
                "download_file/",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: "blob"
                }
            );

            const url = URL.createObjectURL(response.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${props.domain || "Document"}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
        } finally {
            props.loaded(true);
        }
    };

    const handleYesUpload = () => {
        props.loaded(false);
        setDisableUpload(false);
        const ques = {
            "next_question": "Please upload the document",
            "control": "text",
            "control_values": [],
        }
        postQuestion(ques);
    }

    const handleNoUpload = async () => {
        props.loaded(false);
        const nextquestion = await getQuestion();
        await postQuestion(nextquestion);
    }

    const setPromptData = async () => {
        try {
            setShowPrompt(false);
            setEnableSubmit(true);
            props.loaded(false);
            
            let initialQues = {}
            if (props.domain === "validationplan") {
                setLoadView(true);
                initialQues = {
                    "next_question": "Do you want to proceed by uploading a document?",
                    "control": "text",
                    "control_values": [],
                    "uploadOption": true
                }
                postQuestion(initialQues)
            } else {
                initialQues = await getQuestion();
                if (initialQues) {
                    setLoadView(true);
                    await postQuestion(initialQues);
                } else {
                    console.log("No question found.");
                }
            }
        } catch (error) {
            console.error("Error during setPromptData execution:", error);
        }
    }

    const postQuestion = async (ques) => {
        let showConfirmationMsg = false;
        let showDownloadBtn = false;
        let tooltipText = '';
        let showRadioBtn = false;
        let radioBtnOptions = [];
        let question = '';
        let uploadOption = false;

        tooltipText = ques.hover_text;

        if (ques.next_question !== null) {
            question = ques.next_question;
            uploadOption = !!ques.uploadOption;
            showRadioBtn = ques.control === "select";
            setDisableEdit(!showRadioBtn ? false : true);
        } else {
            setDocInfo(ques);
            const fields = ques.updated_fields;
            let summary = "Here is a summary of the information collected:";

            Object.entries(fields).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((item, idx) => {
                        summary += `\n${key} [${idx + 1}]:`;
                        Object.entries(item).forEach(([subKey, subValue]) => {
                            summary += `\n  - ${subKey}: ${subValue || "Not provided"}`;
                        });
                    });
                } else {
                    summary += `\n${key}: ${value || "Not provided"}`;
                }
            });

            question = summary;
            setDisableEdit(true);
            showConfirmationMsg = true;
        }

        if (typeof ques === 'string') {
            setBlobURL(ques);
            question = " Document Generated";
            showDownloadBtn = true;
        }

        const usrMsg = {
            'text': question,
            'type': 'Incoming',
            'reference': [],
            'thumbs': 'None',
            'id': Math.random(),
            'timestamp': null,
            'showConfirmationMsg': showConfirmationMsg,
            'showDownloadBtn': showDownloadBtn,
            'tooltipText': tooltipText,
            'showRadioBtn': showRadioBtn,
            'radioBtnOptions': radioBtnOptions,
            'uploadOption': uploadOption
        };

        setMessage((prevMessages) => {
            return prevMessages.map(msg => {
                if (msg.showConfirmationMsg) return { ...msg, showConfirmationMsg: false };
                if (msg.uploadOption) return { ...msg, uploadOption: false };
                return msg;
            }).concat(usrMsg);
        });

        setEnableSubmit(false);
        props.loaded(true);
    }

    const postAnswer = async (ans) => {
        props.loaded(false);
        let msgtext = ans || document.getElementById('userMsg').value.trim();
        const usrMsg = {
            'text': msgtext,
            'type': 'Outgoing',
            'reference': [],
            'thumbs': 'None',
            'id': Math.random(),
            'timestamp': null
        };
        setMessage((prevMessages) => [...prevMessages, usrMsg]);
        document.getElementById('userMsg').value = "";

        const nextQues = await getQuestion(msgtext);
        if (nextQues) {
            await postQuestion(nextQues);
        }
    }

    const handleDocUpload = (files) => {
        if (files && files.length > 0) {
            toast.success("File uploaded successfully!", {
                position: toast.POSITION.TOP_RIGHT,
                hideProgressBar: true,
                autoClose: 2000,
                closeButton: false
            });

            let readyMsg = {
                'type': 'Upload',
                'filename': files[0].name,
                'status': 'Ready'
            };

            let msg = [...message];
            msg.push(readyMsg);
            setMessage(msg);
            setDisableUpload(true);
            props.loaded(false);

            const file = files[0];
            const formData = new FormData();
            formData.append("file", file);
            formData.append('user_email', props.user_email);
            formData.append('session_id', props.sessionID);
            formData.append('domain', props.domain);

            API.POST(
                props.baseURL,
                "/upload_file",
                formData,
                async (response) => {
                    const nextQues = await getQuestion('', false, response.data.content);
                    postQuestion(nextQues);
                },
                (error) => {
                    toast.error(error.response.data.error, {
                        position: "top-right",
                        hideProgressBar: true,
                        autoClose: 2000,
                        closeButton: false
                    });
                }
            );
        }
    };

    const handleError = (error, file) => {
        toast.error(error.message, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
        });
    }

    return (
        <div className="chatbot">
            <div className='hideShowNewChat btn-container'>
                <button onClick={props.createSession} title="Create New Session" className="new-chat">
                    <img src={start_chat} alt="Start Chat" />
                </button>
            </div>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'scroll' }}>
                    {
                        loadView ?
                            <div className="chatbox">
                                <div className='chatbox-inner'>
                                    <ul>
                                        {message.map((msg, index) => {
                                            if (msg.type === 'Outgoing') {
                                                return <SdlcOutgoing msg={msg.text} key={index} user={user} />
                                            } else if (msg.type === 'Incoming') {
                                                return <SdlcIncoming key={index} {...msg} user={user} postQuestion={postQuestion} postAnswer={postAnswer} getQuestion={getQuestion} downloadDocument={downloadDocument} handleYesUpload={handleYesUpload} handleNoUpload={handleNoUpload} loaded={props.loaded} />
                                            } else if (msg.type === 'Upload') {
                                                return <SdlcUploadMessage key={index} user={user} filename={msg.filename} status={msg.status} />
                                            }
                                            return null;
                                        })}
                                    </ul>
                                </div>
                            </div>
                            : (showPrompt && promptQuest.length) ? <SdlcPrompt promptQuest={promptQuest} setPrompt={setPromptData} uiText={props.uiText} alliasName={props.alliasName} /> : null
                    }
                </Box>

                <div className={disableEdit ? "chat-input disabled" : "chat-input"} style={{ backgroundImage: `url(${background})`, backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
                    <div className='chat-area'>
                        <textarea placeholder="Type your Answer" id='userMsg' disabled={disableEdit} onKeyUp={onKeyUp} onKeyDown={onKeyDown}></textarea>
                        {!disableUpload && (
                            <div className="files">
                                <Files className='files-dropzone' dragActiveClassName="files-dropzone-active" onChange={handleDocUpload} onError={handleError} accepts={['.pdf']} />
                            </div>
                        )}
                        <span id="send-btn" className={enableSubmit ? "material-symbols-rounded active" : "material-symbols-rounded"} onClick={submit} style={{ backgroundImage: `url(${send})`, backgroundRepeat: "no-repeat", backgroundPosition: "center" }}></span>
                    </div>
                    <div className='divider'></div>
                    <div className='footer'>{props.globalUiText.DASHBOARD_FOOTER}</div>
                </div>
            </Box>
        </div>
    );
}

export default SDLCChat;



/// chat component





React.useEffect(() => {

        if (props.sessionChatPath) {
            if (typeof props.session.file_name !== 'undefined') {
                if (props.session.file_name !== null)
                    setUploadedFile({ 'filename': props.session.file_name, 'url': props.session.blob_url });
            }
            getChatHistory();
        } else {
            if (props.resetStates) resetStates();

            setPromptQuest(props.promptQuest);

        }
    }, props.sessionChatPath ? [] : [props]);



const getChatHistory = () => {
            let msgHistory = [...message];
            props.loaded(false);
    
            API.GET(
                props.baseURL,
                path,
                (response) => {
                    if (response.data.length) {
                        response.data.map((obj) => {
                            let question = obj.Human,
                                resp = obj.AI.text_response,
                                reference = obj.AI.docs_metadatas,
                                file_upload = typeof obj.file_upload !== 'undefined' ? obj.file_upload : {};
    
                            if (Object.keys(file_upload).length) {
                                msgHistory.push(
                                    {
                                        'type': 'Upload',
                                        'filename': file_upload.filename,
                                        'status': 'Ready'
                                    }
                                );
                            } else {
                                msgHistory.push(
                                    {
                                        'text': question,
                                        'type': 'Outgoing',
                                        'reference': [],
                                        'thumbs': obj.Thumbs,
                                        'id': obj.chat_id ? obj.chat_id : obj.id,
                                        'timestamp': null
                                    },
                                    {
                                        'text': resp,
                                        'type': 'Incoming',
                                        'reference': props.config.references ? reference : [],
                                        'thumbs': obj.Thumbs,
                                        'id': obj.chat_id ? obj.chat_id : obj.id,
                                        'timestamp': obj.timestamp,
                                        'code': props.config.showCode ? obj.AI.sql_query : null,
                                        'docUrl': props.config.download ? (obj.AI.generated_document_url?.length > 0 ? obj.AI.generated_document_url : '') : ''
    
                                    }
    
                                );
    
                                if (props.config.showImage && obj.AI.chart_url?.length > 0) {
                                    msgHistory.push(
                                        {
                                            'text': '',
                                            'type': 'Incoming',
                                            'imageUrl': obj.AI.chart_url
                                        }
                                    )
                                }
                            }
                        });
                        setMessage(msgHistory);
                        props.loaded(true);
                    } else {
                        if (getTry == 0) {
                            getTry++;
                            setTimeout(() => {
                                getChatHistory();
                            }, 1000);
                        } else {
                            setPromptQuest(props.promptQuest);
                            props.loaded(true);
                        }
                    }
                },
                (error) => {
                    alert('Oh something went wrong! Please refresh the page.');
                    console.log(error);
                    props.loaded(true);
                }
            )
        }


//POST: Human question
    const submit = (bool) => {
        if (!loadView) {
            props.loaded(false);
            props.addNewSession((_path, callback) => {
                path = _path;
                postQuestion(bool);
                if (callback && !postIsPending) callback();
            });
        } else {
            postQuestion(bool);
        }
    }


const postQuestion = (bool) => {
    const msgtext = document.getElementById('userMsg');
    if (enableSubmit || bool) {
        const usrMsg = {
            text: msgtext.value.trim(),
            type: 'Outgoing',
            reference: [],
            thumbs: 'None',
            id: Math.random(),
            timestamp: null
        };

        const loadMsg = {
            text: props.globalUiText.LOADER_TEXT,
            type: 'Default',
            reference: [],
            thumbs: 'None',
            id: null,
            timestamp: null
        };

        setDisableEdit(true);
        setpostIsPending(true);

        const formData = new FormData();
        formData.append("Human", msgtext.value.trim());
        formData.append("domain", props.domain);

        const isStreaming = isStreamingUsecase(props);
        formData.append("streaming", isStreaming ? "true" : "false");

        if (isStreaming) {
            formData.append("streaming_prefix", "");
            formData.append("streaming_suffix", "");
        }

        if (props.usecase.toUpperCase() === "CAS") {
            formData.append("tag_name", props.selectedTagName === "None" ? "None" : props.selectedTagName);
            const values = props.selectedTagName === "None"
                ? ["None"]
                : (props.selectedTagValues.length > 0 ? props.selectedTagValues : []);
            values.forEach((v) => formData.append("tag_values", v));
        }

        if (isStreaming) {
            props.loaded(true);
            setMessage([...message, usrMsg]);

            let aiMsg = {
                text: '🔄 Processing...',
                type: 'Incoming',
            };
            setMessage((currentMessages) => [...currentMessages, aiMsg]);
            let accumulatedTextRef = "";

            API.Stream(
                props.baseURL,
                path,
                formData,
                (chunk) => {
                    accumulatedTextRef += chunk;
                    aiMsg = {
                        text: accumulatedTextRef,
                        type: 'Incoming',
                    };
                    setMessage((currentMessages) => {
                        const messagesExceptLast = currentMessages.slice(0, -1);
                        return [...messagesExceptLast, aiMsg];
                    });
                },
                (response) => {
                    let resp = response?.AI?.text_response?.length > 0
                        ? response.AI.text_response
                        : accumulatedTextRef + '\n\n' + props.globalUiText.ERROR_NOT_FOUND + ' Please refresh the page 🔄';
                    let reference = response?.AI?.docs_metadatas || [];

                    aiMsg = {
                        text: resp,
                        type: 'Incoming',
                        reference: props.config.references ? reference : [],
                        thumbs: '',
                        id: response?.chat_id,
                        code: props.config.showCode ? response.AI.sql_query : null,
                        docUrl: props.config.download && response.AI.generated_document_url?.length > 0 ? response.AI.generated_document_url : ''
                    };

                    setMessage((currentMessages) => {
                        const messagesExceptLast = currentMessages.slice(0, -1);
                        return [...messagesExceptLast, aiMsg];
                    });

                    if (!gotSessionName) {
                        props.getName();
                        gotSessionName = true;
                    }

                    setpostIsPending(false);
                    props.setActiveSessionID(props.sessionID);
                    setDisableEdit(false);
                },
                (error) => {
                    aiMsg = {
                        text: accumulatedTextRef + '\n\n' + props.globalUiText.ERROR_NOT_FOUND + ' Please refresh the page 🔄',
                        type: 'Incoming',
                    };
                    setMessage((currentMessages) => {
                        const messagesExceptLast = currentMessages.slice(0, -1);
                        return [...messagesExceptLast, aiMsg];
                    });
                    console.error(error);
                    props.loaded(true);
                }
            );
        } else {
            props.loaded(false);
            API.POST(
                props.baseURL,
                path,
                formData,
                (response) => {
                    let resp = response.data.AI.text_response?.length > 0
                        ? response.data.AI.text_response
                        : props.globalUiText.ERROR_NOT_FOUND;
                    let reference = response.data.AI.docs_metadatas || [];
                    let aiMsg = {
                        text: resp,
                        type: 'Incoming',
                        reference: props.config.references ? reference : [],
                        thumbs: '',
                        id: response.data.id || response.data.chat_id,
                        timestamp: response.data.timestamp,
                        code: props.config.showCode ? response.data.AI.sql_query : null,
                        docUrl: props.config.download && response.data.AI.generated_document_url?.length > 0 ? response.data.AI.generated_document_url : ''
                    };
                    let imgMsg = {
                        text: ' ',
                        type: 'Incoming',
                        imageUrl: response.data.AI.chart_url
                    };

                    if (props.config.showImage && response.data.AI.chart_url?.length > 0) {
                        setMessage([...message, usrMsg, aiMsg, imgMsg]);
                    } else {
                        setMessage([...message, usrMsg, aiMsg]);
                    }

                    if (!gotSessionName) {
                        props.getName();
                        gotSessionName = true;
                    }

                    setpostIsPending(false);
                    props.setActiveSessionID(props.sessionID);
                    setDisableEdit(false);
                    props.loaded(true);
                },
                (error) => {
                    alert('Something went wrong! Please refresh the page.');
                    console.error(error);
                    props.loaded(true);
                }
            );
        }

        msgtext.value = "";
        setEnableSubmit(false);
    }
};

    const setPromptData = (txt) => {
        const msgtext = document.getElementById('userMsg');
        msgtext.value = txt;
        msgtext.focus();
        setShowPrompt(false);
        setEnableSubmit(true);
        submit(true);
    }

    const onEnterPress = (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            submit();
        }
    }

      const onRateChange = (rating) => {
        props.onRate(rating);
    }

const onUpload = (file) => {
    let getCorrectFileFormat = file ? file.name : "";
    setuploadingFileName(getCorrectFileFormat);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_email", props.user_email);
    formData.append("domain", props.domain);

    API.POST(
        props.baseURL,
        "/upload", // adjust if needed
        formData,
        (response) => {
            if (response) {
                OnSuccess(response);
            } else {
                onError(response, file);
            }
        },
        (error) => {
            onError(error, file);
        },
        true // if your API wrapper expects a flag for multipart/form-data
    );

    setShowPrompt(false);
    setLoadView(true);
};

      const onError = (response, file) => {
        //setUploadedFile({ 'filename': response.data.filename, 'url': response.data.blob_url });
        setuploadingFileName("");

        let readyMsg = {
            'type': 'Upload',
            'filename': file.name,
            'status': 'Failed'
        };

        let msg = [...message];
        msg.push(readyMsg);

        setMessage(msg);
    }
