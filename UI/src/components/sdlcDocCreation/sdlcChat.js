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
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle } from 'react-icons/fa';

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
    const [uploadingFileName, setuploadingFileName] = React.useState("");
    const [uploadedFile, setUploadedFile] = React.useState({});
    const [postIsPending, setpostIsPending] = React.useState(false);

    const user = props.userName();
    let path = props.path;

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

    const onUpload = (file) => {
        let getCorrectFileFormat = file ? file.name : "";
        setuploadingFileName(getCorrectFileFormat);

        const formData = new FormData();
        formData.append("file", file);
        formData.append('user_email', props.user_email);
        // formData.append('session_id', '136');
        formData.append('session_id', props.session?.session_ID || props.sessionID);
        formData.append('domain', props.domain);

        API.POST(
            props.baseURL,
            "/upload_file",
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
            }
        );

        setShowPrompt(false);
        setLoadView(true);
    }

    const OnSuccess = (response) => {
        setUploadedFile({ 'filename': response.data.filename, 'url': response.data.blob_url });
        setuploadingFileName("");
        let readyMsg = {
            'type': 'Upload',
            'filename': response.data.filename,
            'status': 'Ready'
        };

        let msg = [...message];
        msg.push(readyMsg);

        setMessage(msg);
    }

    const onError = (response, file) => {
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
            // formData.append("session_id", "136");
            formData.append("session_id", props.session?.session_ID || props.sessionID);
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

    // const setPromptData = async () => {
    //     try {
    //         setShowPrompt(false);
    //         setEnableSubmit(true);
    //         props.loaded(false);
    //         let initialQues = {}
    //         props.addNewSession(async (path, callback) => {
    //         if (callback && !postIsPending) callback();
    //     });
    //         if (props.domain === "validationplan") {
    //             setLoadView(true);
    //             initialQues = {
    //                 "next_question": "Do you want to proceed by uploading a document?",
    //                 "control": "text",
    //                 "control_values": [],
    //                 "uploadOption": true
    //             }
    //             await postQuestion(initialQues)
    //         }
    //         else {
    //             initialQues = await getQuestion();
    //             if (initialQues) {
    //                 setLoadView(true);
    //                 await postQuestion(initialQues);
    //             } else {
    //                 console.log("No question found.");
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error during setPromptData execution:", error);
    //     }
    // }


    const setPromptData = async () => {
    try {
        setShowPrompt(false);
        setEnableSubmit(true);
        props.loaded(false);

        let initialQues = {};

        await props.addNewSession((newSession) => {
            if (!postIsPending) {
                console.log("New session created:", newSession);
            }
        });

        if (props.domain === "validationplan") {
            setLoadView(true);
            initialQues = {
                next_question: "Do you want to proceed by uploading a document?",
                control: "text",
                control_values: [],
                uploadOption: true
            };
            await postQuestion(initialQues);
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
};


    const submit = async () => {
        await postAnswer(); 
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
            if (ques.uploadOption) {
                uploadOption = true;
            } else {
                uploadOption = false;
            }
            if (ques.control === "select") {
                showRadioBtn = true;
                radioBtnOptions = ques.control_values;
                setDisableEdit(true);
            } else {
                setDisableEdit(false);
            }
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
                if (msg.showConfirmationMsg) {
                    return { ...msg, showConfirmationMsg: false };
                }
                if (msg.uploadOption) {
                    return { ...msg, uploadOption: false };
                }
                return msg;
            }).concat(usrMsg);
        });
        setEnableSubmit(false);
        props.loaded(true);
    }

    const postAnswer = async (ans) => {
        props.loaded(false);
        let msgtext = '';
        ans ? msgtext = ans : msgtext = document.getElementById('userMsg').value.trim();
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
            onUpload(files[0]);
        }
    };

    const handleError = (error, file) => {
        const msg = error.message;
        toast.error(msg, {
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
                            <>
                                <div className="chatbox">
                                    <div className='chatbox-inner'>
                                        <ul>
                                            {
                                                message.map((msg, index) => {
                                                    if (msg.type == 'Outgoing') {
                                                        return (
                                                            <SdlcOutgoing msg={msg.text} key={index} user={user}></SdlcOutgoing>
                                                        )
                                                    }
                                                    else if (msg.type == 'Incoming') {
                                                        return (
                                                            <SdlcIncoming msg={msg.text} key={index} user={user} tooltipText={msg.tooltipText} showConfirmationMsg={msg.showConfirmationMsg} showRadioBtn={msg.showRadioBtn} radioBtnOptions={msg.radioBtnOptions} uploadOption={msg.uploadOption} postQuestion={postQuestion} postAnswer={postAnswer} getQuestion={getQuestion} showDownloadBtn={msg.showDownloadBtn} downloadDocument={downloadDocument} handleYesUpload={handleYesUpload} handleNoUpload={handleNoUpload} loaded={props.loaded}></SdlcIncoming>
                                                        )
                                                    }
                                                    else if (msg.type == 'Upload') {
                                                        return (
                                                            <SdlcUploadMessage user={user} filename={msg.filename} status={msg.status}></SdlcUploadMessage>
                                                        )
                                                    }
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </>
                            : (showPrompt && promptQuest.length) ? <SdlcPrompt promptQuest={promptQuest} setPrompt={setPromptData} uiText={props.uiText} alliasName={props.alliasName} ></SdlcPrompt> : <></>
                    }
                </Box>

                <div className={disableEdit ? "chat-input disabled" : "chat-input"}
                    style={{ backgroundImage: `url(${background})`, backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
                    <div className='chat-area'>
                        <textarea placeholder="Type your Answer" id='userMsg' disabled={disableEdit} onKeyUp={onKeyUp} onKeyDown={onKeyDown}></textarea>
                        {!disableUpload ?
                            <div className="files">
                                <Files
                                    className='files-dropzone'
                                    dragActiveClassName="files-dropzone-active"
                                    onChange={handleDocUpload}
                                    onError={handleError}
                                    accepts={['.pdf']}
                                >
                                </Files>
                            </div> : null}
                        <span id="send-btn" className={enableSubmit ? "material-symbols-rounded active" : "material-symbols-rounded"} onClick={submit} style={{ backgroundImage: `url(${send})`, backgroundRepeat: "no-repeat", backgroundPosition: "center" }}></span>
                    </div>

                    <div className='divider'></div>
                    <div className='footer'>{props.globalUiText.DASHBOARD_FOOTER}</div>
                </div>
            </Box>
        </div>
    )
}

export default SDLCChat;
