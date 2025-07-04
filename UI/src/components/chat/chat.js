import React from 'react';
import './chat.css';
import API from '../../utils/api.service';
import background from '../../assets/Viatris_Gradient_Light_RGB2.png';
import send from '../../assets/paper-airplane.png';
import Incoming from './incoming';
import Outgoing from './outgoing';
import Prompt from './prompt'
import Upload from '../upload/upload';
import { Box } from '@mui/material';
import UploadMessage from './uploadmessage';
import UploadLink from './uploadlink';
import start_chat from '../../assets/start_chat.png';
import { func } from 'prop-types';

function isStreamingUsecase(props) {
    const { dashboardMap: { USECASES } = {} } = props;
    if (Array.isArray(USECASES)) {
        const usecaseObject = USECASES.find(uc => uc.USECASE === props.usecase);
        return !!usecaseObject && usecaseObject.STREAMING === "true";
    }
    return false;
}

function Chat(props) {
    const [message, setMessage] = React.useState([]);
    const [showPrompt, setShowPrompt] = React.useState(true);
    const [loadView, setLoadView] = React.useState(false);
    const [promptQuest, setPromptQuest] = React.useState("");
    const [uploadingFileName, setuploadingFileName] = React.useState("");
    const [uploadedFile, setUploadedFile] = React.useState({ 'filename': '', 'url': '' });
    const [enableSubmit, setEnableSubmit] = React.useState(false);
    const [disableEdit, setDisableEdit] = React.useState(false);
    const [postIsPending, setpostIsPending] = React.useState(false);

    const user = props.userName();
    let path = props.path;
    let gotSessionName = false;
    let getTry = 0;

    const resetStates = (() => {
        setMessage([]);
        setShowPrompt(true);
        setLoadView(false);
        setPromptQuest("");
        setuploadingFileName("");
        setUploadedFile({ 'filename': '', 'url': '' });
        setEnableSubmit(false);
        setDisableEdit(false);
        setpostIsPending(false);
    });

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

    React.useEffect(() => {
        //props.loaded(true);
    }, [promptQuest]);

    React.useEffect(() => {
        if (message.length) {
            setLoadView(true);
        }
    }, [message]);

    //GET: Session Chat History    
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

    const postQuestion = bool => {
        const msgtext = document.getElementById('userMsg');
        if (enableSubmit | bool) {
            const usrMsg = {
                'text': msgtext.value.trim(),
                'type': 'Outgoing',
                'reference': [],
                'thumbs': 'None',
                'id': Math.random(),
                'timestamp': null
            };

            const loadMsg = {
                'text': props.globalUiText.LOADER_TEXT,
                'type': 'Default',
                'reference': [],
                'thumbs': 'None',
                'id': null,
                'timestamp': null
            };

            setDisableEdit(true);

            const data = {
                "Human": msgtext.value.trim(),
                "domain": props.domain,
                "streaming": "false",
                ...(props.usecase.toUpperCase() === "CAS" && {
                    "tag_name": props.selectedTagName === "None" ? "None" : props.selectedTagName,
                    "tag_values": props.selectedTagName === "None"
                        ? ["None"]
                        : props.selectedTagValues.length > 0
                            ? props.selectedTagValues
                            : []
                })
            };

            setpostIsPending(true);

            if (isStreamingUsecase(props)) {
                data["streaming"] = 'true'
                data["streaming_prefix"] = ''
                data["streaming_suffix"] = ''

                props.loaded(true);
                setMessage([...message, usrMsg]);
                let aiMsg = {
                    'text': '🔄 Processing...',
                    'type': 'Incoming',
                };
                setMessage((currentMessages) => [...currentMessages, aiMsg]);
                let accumulatedTextRef = ""

                API.Stream(
                    props.baseURL,
                    path,
                    data,
                    // This function is called for each chunk of data received
                    (chunk) => {
                        // props.loaded(true);
                        accumulatedTextRef += chunk;
                        aiMsg = {
                            'text': accumulatedTextRef,
                            'type': 'Incoming',
                        };
                        setMessage((currentMessages) => {
                            const messagesExceptLast = currentMessages.slice(0, -1);
                            return [...messagesExceptLast, aiMsg];
                        });
                    },
                    // Called when the stream is finished
                    (response) => {
                        let resp = response?.AI?.text_response?.length > 0 ? response.AI.text_response : accumulatedTextRef + '\n\n' + props.globalUiText.ERROR_NOT_FOUND + ' Please refresh the page 🔄'
                        let reference = typeof response?.AI?.docs_metadatas != 'undefined' ? response.AI.docs_metadatas : [];
                        aiMsg = {
                            'text': resp,
                            'type': 'Incoming',
                            'reference': props.config.references ? reference : [],
                            'thumbs': '',
                            'id': response?.chat_id,
                            'code': props.config.showCode ? response.AI.sql_query : null,
                            'docUrl': props.config.download ? (response.AI.generated_document_url?.length > 0 ? response.data.AI.generated_document_url : '') : ''
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
                    // Error handling
                    (error) => {
                        //alert('Something went wrong! Please refresh the page.');
                        aiMsg = {
                            'text': accumulatedTextRef + '\n\n' + props.globalUiText.ERROR_NOT_FOUND + ' Please refresh the page 🔄',
                            'type': 'Incoming',
                        };
                        setMessage((currentMessages) => {
                            const messagesExceptLast = currentMessages.slice(0, -1);
                            return [...messagesExceptLast, aiMsg];
                        });
                        console.log(error);
                        props.loaded(true);
                    }
                );

            }
            // Post Request without Streaming
            else {
                props.loaded(false);
                API.POST(
                    props.baseURL,
                    path,
                    data,
                    (response) => {
                        let resp = response.data.AI.text_response?.length > 0 ? response.data.AI.text_response : props.globalUiText.ERROR_NOT_FOUND,
                            reference = typeof response.data.AI.docs_metadatas != 'undefined' ? response.data.AI.docs_metadatas : [],
                            aiMsg = {
                                'text': resp,
                                'type': 'Incoming',
                                'reference': props.config.references ? reference : [],
                                'thumbs': '',
                                'id': response.data.id ? response.data.id : response.data.chat_id,
                                'timestamp': response.data.timestamp,
                                'code': props.config.showCode ? response.data.AI.sql_query : null,
                                'docUrl': props.config.download ? (response.data.AI.generated_document_url?.length > 0 ? response.data.AI.generated_document_url : '') : ''
                            };
                        let imgMsg = {
                            'text': ' ',
                            'type': 'Incoming',
                            'imageUrl': response.data.AI.chart_url
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
                        console.log(error);
                        props.loaded(true);
                    }
                )
            }
            msgtext.value = "";
            setEnableSubmit(false);
        }
    }

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

    const onKeyUp = (e) => {
        if (e.target.value.trim().length < 2) {
            setEnableSubmit(false);
            return;
        } else {
            setEnableSubmit(true);
        }
    }

    const onRateChange = (rating) => {
        props.onRate(rating);
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

    const onUpload = (file) => {
        let getCorrectFileFormat = file ? file.name : "";
        setuploadingFileName(getCorrectFileFormat);
        props.upload(file, (response) => {
            if (response) {
                OnSuccess(response);
            } else {
                onError(response, file);
            }
        });
        setShowPrompt(false);
        setLoadView(true);
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
                                                    if (msg.type == 'Default') {
                                                        return (
                                                            <Incoming msg={msg.text} rate="false" link={[]} key={index} globalUiText={props.globalUiText} domain={props.domain} user_email={props.user_email}></Incoming>
                                                        )
                                                    }
                                                    else if (msg.type == 'Outgoing') {
                                                        return (
                                                            <Outgoing msg={msg.text} key={index} user={user} globalUiText={props.globalUiText}></Outgoing>
                                                        )
                                                    }
                                                    else if (msg.type == 'Incoming') {
                                                        return (
                                                            <Incoming msg={msg.text} rate={String(!postIsPending)} link={msg.reference?.length ? msg.reference : []} key={index} timestamp={msg.timestamp} rateID={msg.id} rating={onRateChange} thumbs={msg.thumbs} code={msg.code} imageUrl={msg.imageUrl} docUrl={msg.docUrl} globalUiText={props.globalUiText} baseURL={props.baseURL} domain={props.domain} user_email={props.user_email}></Incoming>
                                                        )
                                                    }
                                                    else if (msg.type == 'Upload' & props.config.upload) {
                                                        return (
                                                            <UploadMessage user={user} filename={msg.filename} status={msg.status} globalUiText={props.globalUiText}></UploadMessage>
                                                        )
                                                    }
                                                })

                                            }
                                            {props.config.upload && uploadingFileName.length ? <UploadMessage user={user} filename={uploadingFileName} status="Uploading"></UploadMessage> : <></>}
                                        </ul>
                                    </div>
                                </div>
                            </>
                            : (showPrompt && promptQuest.length) ? <Prompt promptQuest={promptQuest} setPrompt={setPromptData} uiText={props.uiText} alliasName={props.alliasName}></Prompt> : <></>
                    }
                </Box>

                <div className={disableEdit ? "chat-input disabled" : "chat-input"}
                    style={{ backgroundImage: `url(${background})`, backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
                    {(props.config.upload && uploadedFile.filename.length) ? <UploadLink file={uploadedFile} globalUiText={props.globalUiText} baseURL={props.baseURL} domain={props.domain} user_email={props.user_email}></UploadLink> : <></>}
                    <div className='chat-area'>

                        <textarea placeholder="Ask ChatViatris" id='userMsg' onKeyDown={onEnterPress} onKeyUp={onKeyUp}></textarea>
                        {props.config.upload ? <Upload upload={onUpload}></Upload> : <></>}
                        <span id="send-btn" className={enableSubmit ? "material-symbols-rounded active" : "material-symbols-rounded"} onClick={submit} style={{ backgroundImage: `url(${send})`, backgroundRepeat: "no-repeat", backgroundPosition: "center" }}></span>
                    </div>

                    <div className='divider'></div>
                    <div className='footer'>{props.globalUiText.DASHBOARD_FOOTER}</div>
                </div>

            </Box>


        </div>

    )
}

export default Chat;