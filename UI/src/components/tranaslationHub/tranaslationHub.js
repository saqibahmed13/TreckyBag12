import React from 'react';
import { Box, MenuItem, Typography, Button, Alert, AlertTitle, Checkbox, OutlinedInput, ListItemText, Select, FormControl, InputLabel, TableContainer, Table, TableCell, TableHead, TableBody, TableRow, Grid, IconButton, ClickAwayListener } from "@mui/material";
import fileTranslationIcon from '../../assets/uc4.png';
import downloadIcon from '../DataInsights/assets/downloadIcon.png';
import folderIcon from '../DataInsights/assets/folderIcon.png';
import CloseIcon from '../DataInsights/assets/Close.svg';
import dataUploadIcon from '../DataInsights/assets/validateIcon.png';
import start_chat from '../../assets/start_chat.png';
import Rating from './rating';
import API from "../../utils/api.service";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import './tranaslationHub.css';

const TranaslationHub = (props) => {
    const fileInputRef = React.useRef(null);
    const fileInputRefGlossary = React.useRef(null);
    const textareaRef = React.useRef(null);
    const [fileStatus, setFileStatus] = React.useState([]);
    const [fileStatusGlossary, setFileStatusGlossary] = React.useState([]);
    const [validated, setValidated] = React.useState(false);
    const [validatedGlossary, setValidatedGlossary] = React.useState(false);
    const [results, setResults] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState(null);
    const [uiLabel, setUiLabel] = React.useState({});
    const [languageValues, setLanguageValues] = React.useState({});
    const [fileUploaded, setFileUploaded] = React.useState(false);
    const [languageName, setLanguageName] = React.useState([]);
    const [errorFileValidationMsg, setErrorFileValidationMsg] = React.useState(false);
    const [fileDuplicateValidation, setFileDuplicateValidation] = React.useState(false);
    const [errorGlossaryFileValidationMsg, setErrorGlossaryFileValidationMsg] = React.useState(false);
    const [errorLangaugeValidationMsg, setErrorLangaugeValidationMsg] = React.useState(false);
    const [errorFileSizeValidationMsg, setErrorFileSizeValidationMsg] = React.useState(false);
    const [isGroceryFile, setIsGroceryFile] = React.useState(false);
    const [isDocumentsUploaded, setIsDocumentsUploaded] = React.useState(false);
    const [hubTranaslationData, setHubTranaslationData] = React.useState([]);
    const [glossaryFileName, setGlossaryFileName] = React.useState("");
    const [glossaryFileUrl, setGlossaryFileUrl] = React.useState("");
    const [isRating, setIsRating] = React.useState(false);
    const [getChatId, setGetChatId] = React.useState("");
    const [ratingComments, setRatingComments] = React.useState("");
    const [ratingData, setRatingData] = React.useState("");
    const [isRatingError, setIsRatingError] = React.useState(false);
    const [ratingDataItemsThumbs, setRatingDataItemsThumbs] = React.useState("");
    const [ratingDataItemsComments, setRatingDataItemsComments] = React.useState("");
    const [isRatingCommentEditable, setIsRatingCommentEditable] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [showingMsgDataNotFound, setShowingMsgDataNotFound] = React.useState("");
    const [isShowingMsgDataNotFound, setIsShowingMsgDataNotFound] = React.useState(false);
    const [selectedFilesData, setSelectedFilesData] = React.useState([]);
    const maxAllFilesLength = 5;
    const maxGlossaryFilesLength = 1;
    let getTry = 0;
    const maxFileSize = 50 * 1024 * 1024; // 50MB limit
    const maxTotalSize = 50 * 1024 * 1024; // 50MB limit
    let getActiveSessionId = null;


    const resetStates = (() => {
        setResults(false);
        setFileUploaded(false);
        setFileStatus([]);
        setLanguageName([]);
        setFileStatusGlossary([]);
        setSelectedFilesData([]);
        setErrorFileValidationMsg(false);
        setErrorFileSizeValidationMsg(false);
        setErrorLangaugeValidationMsg(false);
        setErrorGlossaryFileValidationMsg(false);
        setFileDuplicateValidation(false);
        setErrorMsg(false);
    });

    React.useEffect(() => {
        const _tranaslationHubJsonData = props ? props.staticTranslationHubText : [];
        const _getLanguage = _tranaslationHubJsonData.TranaslationHubLungage;
        setLanguageValues(_getLanguage);
        setUiLabel(_tranaslationHubJsonData);
        if (props.sessionTranaslationPath) {
            getTranaslationHistory();
        } else {
            if (props.resetStates) resetStates();
        }
    }, [props]);


    const getTranaslationHistory = () => {
        setHubTranaslationData([]);
        getActiveSessionId = props && props.sessionID;
        if (props && props.sessionID == null) {
            getActiveSessionId = props && props.getSessionID;
        }
        API.GET(
            props.baseURL,
            'chat/' + getActiveSessionId + '?user_email=' + `${props.user_email}` + '&domain=' + `${props.domain}`,
            (response) => {
                if (response && response?.data) {
                    if (props && props.sessionTimeOutMsg == "Network Error") {
                        setShowingMsgDataNotFound("The translation is taking longer than expected. Please revisit the session again later or reduce the file size and start a new session.");
                        setIsShowingMsgDataNotFound(true);
                        setResults(true);
                    } else if (response?.data && response?.data?.logs == undefined) {
                        setShowingMsgDataNotFound(response.data);
                        setIsShowingMsgDataNotFound(true);
                        setResults(true);
                    } else {
                        if (response?.data && response?.data?.logs?.glossary_url != 'NA') {
                            let getGlossaryFileName;
                            let glossaryFileNameData;
                            if (response.data.logs && response.data.logs.glossary_name == undefined) {
                                getGlossaryFileName = response.data.logs.glossary_url.split('/').pop();
                                glossaryFileNameData = getGlossaryFileName;
                            } else {
                                glossaryFileNameData = response.data.logs ? response.data.logs.glossary_name : "NA";
                            }
                            setGlossaryFileName(glossaryFileNameData)
                            const glossaryFileUrlName = response.data.logs.glossary_url;
                            setGlossaryFileUrl(glossaryFileUrlName);
                        }
                        if (response.data && response.data.logs.transaction_status == "Succeeded") {
                            setIsRating(true);
                        }
                        if (response.data && response.data.thumbs_feedback == "None") {
                            setRatingDataItemsComments("");
                        } else {
                            setRatingDataItemsComments(response.data.thumbs_feedback);
                        }
                        if (response.data && response.data.Thumbs == "None") {
                            setRatingDataItemsThumbs("None");
                        } else {
                            setRatingDataItemsThumbs(response.data.Thumbs);
                        }
                        const getData = [];
                        let getResponseData = response.data.logs;
                        let getOpertaionData = getResponseData.operation_details;

                        if (getOpertaionData && getOpertaionData.length > 0) {
                            getOpertaionData.forEach(data => {
                                let getFileData = data.Details;
                                data.Details = removeDuplicateLanguages(getFileData);
                            });
                        }
                        getData.push(getResponseData);
                        setHubTranaslationData(getData);
                        setGetChatId(response.data.chat_id);
                        setResults(true);
                        setIsGroceryFile(false);
                        setIsShowingMsgDataNotFound(false);
                    }

                } else {
                    if (getTry == 0) {
                        getTry++;
                        setTimeout(() => {
                            getTranaslationHistory();
                        }, 1000);
                    }
                }
            },
            (error) => {
                setFileUploaded(true);
            }
        )
    }

    const removeDuplicateLanguages = (dataArray) => {
        if (!Array.isArray(dataArray)) return [];

        let flatArray = dataArray.flat();
        let uniqueData = new Map();

        flatArray.forEach(obj => {
            let languageKey = Object.keys(obj).find(key => key !== "target_file_name");
            if (languageKey && !uniqueData.has(languageKey)) {
                uniqueData.set(languageKey, obj);
            }
        });

        return Array.from(uniqueData.values());
    };

    const handleFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileUploadGlossary = () => {
        fileInputRefGlossary.current.click();
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };


    const handleDragOverGlossary = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };


    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!fileStatus) {
            fileStatus = [];
        }
        const selectedFiles = event.dataTransfer.files;
        const files = Object.values(selectedFiles);
        const totalFiles = fileStatus.length + files.length;
        if (totalFiles > 5) {
            toast.error("You can only upload up to 5 files.", {
                position: toast.POSITION.TOP_RIGHT,
                hideProgressBar: true,
                autoClose: 2000,
                closeButton: false
            });
            return;
        }
        uploadToBlobStorage(files);
    };

    const handleDropGlossary = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (fileStatusGlossary && fileStatusGlossary.length == 0) {
            const selectedFiles = event.dataTransfer.files;
            const files = Object.values(selectedFiles);
            uploadToBlobStorageGlossary(files);
        }
    };


    const deleteFile = (item) => {
        if (props && props.getTranaslationUloadedFile.length > 0) {
            const getTransalationalFileData = [...props.getTranaslationUloadedFile];
            const selectedFile = item?.fileName;
            const updatedFiles = selectedFilesData.filter(file => file.name !== selectedFile);
            setSelectedFilesData(updatedFiles);
            const newTotalSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);
            if (newTotalSize <= maxTotalSize) {
                setErrorFileSizeValidationMsg(false);
            }
            const getActualFileUrls = getTransalationalFileData.filter(data => data.file_Name == selectedFile);
            let getFileUrls;
            let fileDataUrls;
            const normalizeFileNameData = (name) => {
                if (!name || typeof name !== "string") return "";
                return name.replace(/[_-]/g, " ").trim();
            };
            if (getActualFileUrls && getActualFileUrls.length > 0) {
                getFileUrls = getTransalationalFileData.filter(data =>
                    normalizeFileNameData(data?.file_Name) === normalizeFileNameData(selectedFile)
                );
                fileDataUrls = getFileUrls[0]?.file_Url;
            } else {
                getFileUrls = getTransalationalFileData.filter(data => {
                    if (typeof data === "string") {
                        const parts = data?.split("|");
                        const fileName = parts?.[1] ? normalizeFileNameData(parts[1]) : "";
                        return fileName === normalizeFileNameData(selectedFile);
                    }
                    return false;
                });
                fileDataUrls = getFileUrls;
            }
            const formData = new FormData();
            formData.append('user_email', props.user_email);
            formData.append('user_session_id', props.sessionID);
            formData.append('blob_url', fileDataUrls);
            formData.append('domain', props.domain);

            API.DELETE_HUBFILE(
                props.baseURL,
                `sourcefile_upload?user_email=${props.user_email}&domain=${props.domain}`,
                formData,
                (res) => {
                    if (res) {
                        if (fileStatus && fileStatus.length > 0) {
                            const updatedData = fileStatus.filter(item => item.fileName !== selectedFile);
                            setFileStatus(updatedData);
                            const normalizeFileName = (name) => name.replace(/[_-]/g, " ").trim();
                            const processFiles = (getTransalationalFileData, selectedFile) => {
                                return getTransalationalFileData
                                    .filter(file => {
                                        let fileName = "";
                                        if (typeof file === "string") {
                                            fileName = file.split("|")[1]?.trim();
                                        } else if (file.file_Url) {
                                            fileName = file.file_Url.split("|")[1]?.trim();
                                        } else if (file.file_Name) {
                                            fileName = file.file_Name.trim();
                                        }
                                        return normalizeFileName(fileName) !== normalizeFileName(selectedFile);
                                    })
                                    .map(file => (typeof file === "string" ? file : file.file_Url));
                            };

                            const updatedUploadedFiles = processFiles(getTransalationalFileData, selectedFile);
                            props.updateUploadedFile([...updatedUploadedFiles]);
                            if (updatedUploadedFiles.length === 0) {
                                setIsDocumentsUploaded(false);
                            }
                            props.fileToDeleted(selectedFile);
                        }
                        if (fileStatusGlossary && fileStatusGlossary.length > 0) {
                            const updatedDataGlossary = fileStatusGlossary.filter(item => item.fileName !== selectedFile);
                            setFileStatusGlossary(updatedDataGlossary);
                            if (updatedDataGlossary.length === 0) {
                                setIsGroceryFile(false);
                            }
                        }

                        props.loaded(true);
                        toast.success("File deleted successfully!", {
                            position: toast.POSITION.TOP_RIGHT,
                            hideProgressBar: true,
                            autoClose: 2000,
                            closeButton: false
                        });
                    }
                },
                (err) => {
                    props.loaded(true);
                    toast.error("Something went wrong, please try again later", {
                        position: toast.POSITION.TOP_RIGHT,
                        hideProgressBar: true,
                        autoClose: 2000,
                        closeButton: false
                    });
                    console.error(err);
                }
            );
        } else {
            props.loaded(true);
            toast.error("Something went wrong, please try again later", {
                position: toast.POSITION.TOP_RIGHT,
                hideProgressBar: true,
                autoClose: 2000,
                closeButton: false
            });
        }
    };


    const downloadTransalatedFile = (itemUrl, itemName) => {
        props.loaded(false);
        const file_blob_url = encodeURIComponent(itemUrl);
        const getDownloadFileName = itemName;
        API.DOWNLOAD(props.baseURL, `file_download?file_blob_url=${file_blob_url}&user_email=${props.user_email}&domain=${props.domain}&user_session_id=${props.sessionID}`, getDownloadFileName,
            (res) => {
                props.loaded(true);
                toast.success("File downlaoded successfully!", {
                    position: toast.POSITION.TOP_RIGHT,
                    hideProgressBar: true,
                    autoClose: 2000,
                    closeButton: false
                });
            }, (err) => {
                props.loaded(true);
                toast.error("Something went wrong, please try again later", {
                    position: toast.POSITION.TOP_RIGHT,
                    hideProgressBar: true,
                    autoClose: 2000,
                    closeButton: false
                });
                console.log(err);
            });
    }

    const handleUpload = () => {
        if (errorFileSizeValidationMsg) {
            setErrorFileSizeValidationMsg(true);
            return
        }
        if (languageName && languageName.length == 0) {
            setErrorLangaugeValidationMsg(true);
        } else if (!isDocumentsUploaded) {
            setErrorFileValidationMsg(true);
        } else {
            let _getSelctedLanguage = [];
            languageValues.forEach(item => {
                if (item) {
                    languageName.forEach(data => {
                        if (item.value == data) {
                            _getSelctedLanguage.push(item.key);
                        }
                    });
                }
            });
            const dataSet = {
                "user_email": props ? props.user_email : "",
                "user_session_id": props ? props.user_session_id : "",
                "domain": props ? props.domain : "",
                "blob_list": props ? props.blob_list : "",
                "dest_language": _getSelctedLanguage,
                "glossary": isGroceryFile ? isGroceryFile : false,
                "glossary_url": props ? props.glossary_url : "",
            }
            props.submitTranaslationHub(dataSet);
            setFileUploaded(true);
            setErrorMsg(null);
            setErrorFileValidationMsg(false);
            setErrorFileSizeValidationMsg(false);
            setErrorLangaugeValidationMsg(false);
            setErrorGlossaryFileValidationMsg(false);
            setFileDuplicateValidation(false);
        }
    }

    const uploadToBlobStorage = async (selectedFile) => {
        setErrorFileValidationMsg(false);
        setErrorFileSizeValidationMsg(false);
        setErrorLangaugeValidationMsg(false);
        setErrorGlossaryFileValidationMsg(false)
        setFileDuplicateValidation(false);
        const newFiles = Array.from(selectedFile);
        const getFileName = selectedFile[0] ? selectedFile[0].name : "";
        const getFileExtension = getFileName.split('.').pop();
        const getFileDataName = fileStatus.filter(item => item.fileName == getFileName);
        if (selectedFile == null) {
            return
        }
        if (getFileDataName && getFileDataName.length > 0) {
            setFileDuplicateValidation(true);
            return
        }
        if (getFileExtension != 'txt' && getFileExtension != 'csv' && getFileExtension != 'xlsx' && getFileExtension != 'doc' && getFileExtension != 'docx' && getFileExtension != 'msg' && getFileExtension != 'pptx' && getFileExtension != 'pdf' && getFileExtension != 'xlf') {
            setErrorFileValidationMsg(true);
            return
        } else if (newFiles.length + selectedFilesData.length > maxFileSize) {
            setErrorFileSizeValidationMsg(true);
            return
        }
        for (let file of newFiles) {
            if (file.size > maxFileSize) {
                setErrorFileSizeValidationMsg(true);
                return;
            }
        }
        const totalSize = [...selectedFilesData, ...newFiles].reduce((sum, file) => sum + file.size, 0);
        if (totalSize > maxTotalSize) {
            setErrorFileSizeValidationMsg(true);
            return;
        }
        setSelectedFilesData((prevFiles) => [...prevFiles, ...newFiles]);
        const blobName = selectedFile[0] ? selectedFile[0].name : '';
        fileInputRef.current.value = null;
        setFileStatus((previousData) => {
            const existingItem = previousData.find(item => item.fileName === blobName);
            if (existingItem) {
                const updatedData = previousData.map(item => {
                    if (item.fileName === blobName) {
                        return { ...item, status: uiLabel["Uploaded"] };
                    }
                    return item;
                });
                return updatedData
            } else {
                const newItem = { fileName: blobName, status: uiLabel["Uploaded"] };
                const updatedData = [...previousData, newItem]
                return updatedData
            }
        });
        let _fileData = selectedFile ? selectedFile[0] : "";
        if (_fileData) {
            props.uploadFileHub(_fileData, false);
            setIsDocumentsUploaded(true);
        }
    }

    const uploadToBlobStorageGlossary = async (selectedFile) => {
        setErrorGlossaryFileValidationMsg(false);
        setErrorFileSizeValidationMsg(false);
        setErrorLangaugeValidationMsg(false);
        setErrorFileValidationMsg(false);
        setFileDuplicateValidation(false);
        setLanguageName([]);
        const fileSize = selectedFile[0] ? selectedFile[0].size : "";
        const getFileName = selectedFile[0] ? selectedFile[0].name : "";
        const getFileExtension = getFileName.split('.').pop();
        if (selectedFile == null) {
            return
        }
        if (getFileExtension != 'csv') {
            setErrorGlossaryFileValidationMsg(true);
            return
        } else if (fileSize > maxFileSize) {
            setErrorFileSizeValidationMsg(true);
            return
        }
        const blobName = selectedFile[0] ? selectedFile[0].name : '';
        fileInputRefGlossary.current.value = null;
        setFileStatusGlossary((previousData) => {
            const existingItem = previousData.find(item => item.fileName === blobName);
            if (existingItem) {
                const updatedData = previousData.map(item => {
                    if (item.fileName === blobName) {
                        return { ...item, status: uiLabel["Uploaded"] };
                    }
                    return item;
                });
                return updatedData
            } else {
                const newItem = { fileName: blobName, status: uiLabel["Uploaded"] };
                const updatedData = [...previousData, newItem]
                return updatedData
            }
        });
        let _fileData = selectedFile ? selectedFile[0] : "";
        if (_fileData) {
            setIsGroceryFile(true);
            props.uploadFileHub(_fileData, true);
        }
    }

    const handleFileChange = async (event) => {
        const selectedFiles = event.target.files;
        const files = Object.values(selectedFiles);
        uploadToBlobStorage(files);
    };

    const handleFileChangeGlossary = async (event) => {
        const selectedFiles = event.target.files;
        const files = Object.values(selectedFiles);
        uploadToBlobStorageGlossary(files);
    };


    const handleChangeLanguage = (event) => {
        const {
            target: { value },
        } = event;
        setLanguageName(
            typeof value === 'string' ? value.split(',') : value,
        );
        setErrorLangaugeValidationMsg(false);
        setErrorFileValidationMsg(false);
        setErrorGlossaryFileValidationMsg(false);
        setFileDuplicateValidation(false);
    };


    const onRateChange = (rate) => {
        setRatingComments("");
        setRatingData(rate);
        props.onRate({
            'rating': rate,
            'chatId': getChatId,
        });
        setRatingDataItemsThumbs("");
    }


    const handleChangeRatingComments = (event) => {
        setRatingComments(event);
        setIsRatingError(false);
        setIsRatingCommentEditable(true);
    };



    const submitThumbsData = () => {
        if (ratingComments == "") {
            setIsRatingError(true);
            return;
        }
        setIsRatingCommentEditable(false);
        props.onRateComments({
            'chatId': getChatId,
            'thumbs_feedback': ratingComments
        });
    }


    const getUploadedItem = (item) => {
        let borderColor = '1px solid #9982AB'
        let icon = null
        let statusColor = "#474747"
        let displayDeleteIcon = true
        return (
            <div>
                {!fileUploaded ?
                    <Box sx={{ display: 'flex', border: borderColor, borderRadius: '5px', alignItems: 'top', background: '#9982ab1a', padding: '15px', gap: '20px' }}>
                        <img src={folderIcon} style={{ width: "16px", height: "16px" }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: '1', mt: '-5px' }}>
                            <Typography sx={{ color: "#474747", fontWeight: "400", fontSize: "16px", fontFamily: "Open Sans" }}>
                                {item.fileName}
                            </Typography>
                            <Typography sx={{ color: statusColor, fontWeight: "700", fontSize: "14px", fontFamily: "Open Sans", textTransform: 'uppercase' }}>
                                {(item.status === "failed") ? item.errorMsg : item.status}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {icon && <img src={icon} style={{ width: "16px", height: "16px" }} />}
                            {displayDeleteIcon && <img src={CloseIcon} style={{ width: "16px", height: "16px" }} onClick={() => deleteFile(item)} />}
                        </Box>
                    </Box> : undefined
                }
            </div>
        )
    }


    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };


    const handleDropdownOpen = () => {
        setOpen(true);
    };

    const handleDropdownClose = () => {
        setOpen(false);
    };

    const downloadCsv = () => {
        const fileUrl = "/GlossaryTemplate.csv";
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = "GlossaryTemplate.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    const getInputView = () => {
        return (
            <Box sx={{ m: "32px", ml: "200px", mr: "200px", display: "flex", gap: "15px", flexDirection: "column", flexGrow: "1", overflowY: 'auto' }}>
                {!fileUploaded ?
                    <> <div className='hideShowNewChat btn-container'>
                        <button onClick={props.createSession} title="Create New Session" className="new-chat">
                            <img src={start_chat} alt="Start Chat" />
                        </button>
                    </div>
                        <div className="hubBoxContent">
                            <p>Welcome to the ChatViatris Document Translation Hub. Start by uploading 1 to 5 documents for translation into up to 5 languages, and optionally include a glossary file to refine translation. Please ensure all translations are reviewed by a native speaker and follow your existing review processes before final use.</p>
                        </div><Box sx={{ display: "flex", gap: '5px', padding: '30px', background: '#F0E9F4', alignItems: 'start', flexDirection: "column", height: '240px' }}>
                            <Box sx={{ display: "flex", color: '#F0E9F4', flexDirection: "row", alignItems: 'center' }}>
                                <img src={fileTranslationIcon} height={'25px'} color='#703E97' />
                                <Typography sx={{ color: "#703E97", padding: '5px', fontWeight: "700", fontSize: "20px", fontFamily: "Open Sans" }}>
                                    {uiLabel["TranaslationHub_Label"]}
                                </Typography>
                            </Box>
                            <Box onDrop={handleDrop} onDragOver={handleDragOver}
                                sx={{ background: '#ffffff', display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: "100%", height: '196px', border: "1px dashed #474747", overflowY: 'auto' }}>
                                {uiLabel["DropFiles"]?.map((instructions, index) => (
                                    <Typography key={index} sx={{ color: "#474747", fontWeight: "400", fontSize: "16px", fontFamily: "Open Sans", whiteSpace: 'pre-line' }}>
                                        {instructions}
                                    </Typography>
                                ))}
                                <Button variant='contained' onClick={handleFileUpload} sx={{ backgroundColor: '#F1CB14', color: "#2A276E", "&:hover": { backgroundColor: "#F1CB14" }, "&.Mui-disabled": { backgroundColor: "#F1CB14" } }} disabled={fileStatus.length >= maxAllFilesLength || validated}>
                                    <Typography paddingLeft={'5px'}>
                                        {uiLabel["BrowseFiles"]}
                                    </Typography>
                                </Button>
                            </Box>
                        </Box>
                        {fileStatus.length > 0 &&
                            fileStatus.map((item, index) => (
                                <div key={index}>{getUploadedItem(item)}</div>
                            ))
                        }
                        <input type="file" accept=".csv, .xlsx, .txt, .doc, .docx, .msg, .pptx, .pdf, .xlf" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        <Box sx={{ display: "flex", gap: '5px', padding: '10px', background: '#F0E9F4', alignItems: 'start', flexDirection: "column", height: '220px' }}>
                            <Box sx={{ display: "flex", color: '#F0E9F4', flexDirection: "row", alignItems: 'center' }}>
                                <img src={fileTranslationIcon} height={'25px'} color='#703E97' />
                                <Typography sx={{ color: "#703E97", padding: '5px', fontWeight: "700", fontSize: "20px", fontFamily: "Open Sans" }}>
                                    {uiLabel["GlossaryTemplate"]}
                                </Typography>
                            </Box>
                            <Box sx={{ justifyContent: "space-between", display: "flex", flexDirection: "row", width: "100%" }}>
                                <Typography sx={{ color: "#474747", fontWeight: "400", fontSize: "15px", fontFamily: "Open Sans" }}>
                                    {uiLabel["GlossaryDesc"]}
                                </Typography>
                                <Button variant='text' onClick={(e) => { downloadCsv() }} sx={{ textTransform: 'capitalize', alignItems: 'end' }}>
                                    <img src={downloadIcon} height={'25px'} />
                                    <Typography paddingLeft={'5px'} sx={{ color: '#703E97' }}>
                                        {uiLabel["DownloadCsv"]}
                                    </Typography>
                                </Button>
                            </Box>
                            <Box onDrop={handleDropGlossary} onDragOver={handleDragOverGlossary}
                                sx={{ background: '#ffffff', display: "flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: "100%", height: '220px', border: "1px dashed #474747", overflowY: 'auto' }}>
                                {uiLabel["DropFilesGlossery"]?.map((instructions, index) => (
                                    <Typography key={index} sx={{ color: "#474747", fontWeight: "400", fontSize: "16px", fontFamily: "Open Sans", whiteSpace: 'pre-line' }}>
                                        {instructions}
                                    </Typography>
                                ))}
                                <Button variant='contained' onClick={handleFileUploadGlossary} sx={{ backgroundColor: '#F1CB14', color: "#2A276E", "&:hover": { backgroundColor: "#F1CB14" }, "&.Mui-disabled": { backgroundColor: "#F1CB14" } }} disabled={fileStatusGlossary.length >= maxGlossaryFilesLength || validatedGlossary}>
                                    <Typography paddingLeft={'5px'}>
                                        {uiLabel["BrowseFiles"]}
                                    </Typography>
                                </Button>
                            </Box>
                        </Box>
                        <input type="file" accept=".csv" ref={fileInputRefGlossary} style={{ display: 'none' }} onChange={handleFileChangeGlossary} />

                        {fileStatusGlossary.length > 0 &&
                            fileStatusGlossary.map((item, index) => (
                                <div key={index}>{getUploadedItem(item)}</div>
                            ))
                        }

                        <Grid container>

                            {errorMsg &&
                                <Alert severity="warning">
                                    <AlertTitle>Error</AlertTitle>
                                    {errorMsg}
                                </Alert>}
                            {errorFileValidationMsg &&
                                <Alert severity="warning">
                                    <AlertTitle>Error</AlertTitle>
                                    {'Please select the proper file type for uploading. Accepted file types are .txt, .csv, .xlsx, .doc, .docx, .msg, .pptx, .pdf, .xlf'}
                                </Alert>}

                            {fileDuplicateValidation &&
                                <Alert severity="warning">
                                    <AlertTitle>Error</AlertTitle>
                                    {'Please select a different file because you have already uploaded this file to the translation.'}
                                </Alert>}

                            {errorGlossaryFileValidationMsg &&
                                <Alert severity="warning">
                                    <AlertTitle>Error</AlertTitle>
                                    {'Please select the proper file type for uploading Glossary file. Accepted file type is .csv'}
                                </Alert>}

                            {errorFileSizeValidationMsg && (
                                <Alert severity="warning">
                                    <AlertTitle>Error</AlertTitle>
                                    You have exceeded the file size limits of the Translation Hub. The tool is limited to a maximum of 5 files and 50MB in total size.
                                    You can visit
                                    <a
                                        href="https://myl.sharepoint.com/sites/ChatViatrisCenterofExcellence"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontWeight: "bold", margin: "0 5px" }}
                                    >
                                        ChatViatris COE
                                    </a>
                                    for options on how to
                                    <a
                                        href="https://myl.sharepoint.com/sites/ChatViatrisCenterofExcellence/Source%20Documents/Translation%20Hub/ChatViatris%20Translation%20Hub%20-%20Managing%20File%20Limits.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontWeight: "bold", marginLeft: "5px" }}
                                    >
                                        work with file size limits.
                                    </a>
                                </Alert>
                            )}
                            {errorLangaugeValidationMsg &&
                                <Alert severity="warning">
                                    <AlertTitle>Error</AlertTitle>
                                    {'Please select the destination language and files for translation.'}
                                </Alert>}
                        </Grid>
                        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                            <Grid item xs="auto">
                                {!isGroceryFile ?
                                    <div className='WidthAlignment'>
                                        <FormControl className="fullWidth">
                                            <InputLabel id="demo-multiple-checkbox-label">
                                                Select target language(s)
                                            </InputLabel>
                                            <Select
                                                labelId="demo-multiple-checkbox-label"
                                                id="demo-multiple-checkbox"
                                                multiple
                                                value={languageName}
                                                onChange={handleChangeLanguage}
                                                open={open}
                                                onClose={handleDropdownClose}
                                                onOpen={handleDropdownOpen}
                                                input={<OutlinedInput label="Select target language(s)" />}
                                                renderValue={(selected) => selected.join(", ")}
                                                MenuProps={{
                                                    disablePortal: false,
                                                    PaperProps: {
                                                        sx: {
                                                            width: 'auto',
                                                            minWidth: 200,
                                                            marginBottom: 8,
                                                        },
                                                    },
                                                    anchorOrigin: {
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    },
                                                    transformOrigin: {
                                                        vertical: 'top',
                                                        horizontal: 'left',
                                                    },
                                                }}
                                            >
                                                <Box display="flex" alignItems="left" justifyContent="space-between" padding="8px">
                                                    <span>Select target language(s)</span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDropdownClose();
                                                        }}
                                                    >
                                                        <img
                                                            src={CloseIcon}
                                                            style={{ width: "21px", height: "21px", marginRight: "15px", background: "rgb(183 153 207 / 25%)" }}
                                                            alt="close"
                                                        />
                                                    </IconButton>
                                                </Box>
                                                {Array.isArray(languageValues) && languageValues.length > 0 ? (
                                                    languageValues.map((name) => (
                                                        <MenuItem
                                                            key={name.key}
                                                            value={name.value}
                                                            disabled={languageName.length >= 5 && !languageName.includes(name.value)}
                                                        >
                                                            <Checkbox checked={languageName.includes(name.value)} />
                                                            <ListItemText primary={name.value} />
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>
                                                        <em>No options available</em>
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </div>
                                    :
                                    <div className='WidthAlignment'>
                                        <FormControl className="fullWidth">
                                            <InputLabel id="demo-multiple-checkbox-label">
                                                Select target language(s)
                                            </InputLabel>
                                            <Select
                                                labelId="demo-multiple-checkbox-label"
                                                id="demo-multiple-checkbox"
                                                multiple
                                                value={languageName}
                                                onChange={handleChangeLanguage}
                                                open={open}
                                                onClose={handleDropdownClose}
                                                onOpen={handleDropdownOpen}
                                                input={<OutlinedInput label="Select target language(s)" />}
                                                renderValue={(selected) => selected.join(", ")}
                                                MenuProps={{
                                                    disablePortal: false,
                                                    PaperProps: {
                                                        sx: {
                                                            width: 'auto',
                                                            minWidth: 200,
                                                            marginBottom: 8,
                                                        },
                                                    },
                                                    anchorOrigin: {
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    },
                                                    transformOrigin: {
                                                        vertical: 'top',
                                                        horizontal: 'left',
                                                    },
                                                }}
                                            >
                                                <Box display="flex" alignItems="left" justifyContent="space-between" padding="8px">
                                                    <span>Select target language(s)</span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDropdownClose();
                                                        }}
                                                    >
                                                        <img
                                                            src={CloseIcon}
                                                            style={{ width: "21px", height: "21px", marginRight: "15px", background: "rgb(183 153 207 / 25%)" }}
                                                            alt="close"
                                                        />
                                                    </IconButton>
                                                </Box>
                                                {Array.isArray(languageValues) && languageValues.length > 0 ? (
                                                    languageValues.map((name) => (
                                                        <MenuItem
                                                            key={name.key}
                                                            value={name.value}
                                                            disabled={
                                                                languageName.length >= 1 && !languageName.includes(name.value)
                                                            }
                                                        >
                                                            <Checkbox checked={languageName.includes(name.value)} />
                                                            <ListItemText primary={name.value} />
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem disabled>
                                                        <em>No options available</em>
                                                    </MenuItem>
                                                )}

                                            </Select>
                                        </FormControl>
                                    </div>
                                }

                            </Grid>
                            <Grid item xs="auto" className="floatRightAlignmentBtn">
                                {props.isFileUploaded ?
                                    <Button sx={{ background: "#703E97", borderRadius: "2px", backgroundColor: "#703E97", float: "right", margin: "10px", "&:hover": { backgroundColor: "#8C5BAC" } }}
                                        onClick={() => handleUpload()}>
                                        <img src={dataUploadIcon} style={{ width: "16px", height: "16px", paddingRight: '5px' }} />
                                        <Typography sx={{ color: "#F3F3F3", fontWeight: "400", fontSize: "16px", fontFamily: "Open Sans", padding: "4px" }}>
                                            {uiLabel["Submit"]}
                                        </Typography>
                                    </Button>
                                    : undefined}
                            </Grid>
                        </Grid>

                    </> : undefined}
            </Box >
        )
    }

    const getInputViewResult = () => {
        if (hubTranaslationData && hubTranaslationData.length > 0) {
            const destinationData = hubTranaslationData[0]?.operation_details || [];
            if (destinationData.length > 0) {
                for (let i = 0; i < destinationData.length; i++) {
                    const resultFileData = [];
                    if (destinationData[i]?.Details.length > 0) {
                        const _getData = destinationData[i].Details;
                        for (let j = 0; j < _getData.length; j++) {
                            const fileObject = _getData[j];
                            const languageKey = Object.keys(fileObject).find(key => key !== "target_file_name");
                            const _fileLang = languageKey;
                            const _fileUrl = fileObject[languageKey]?.replace(/"/g, '').trim();

                            let _fileName = fileObject.target_file_name || "NA";
                            if (_fileUrl === 'Failed to translate') {
                                _fileName = 'Failed to translate - Please try again later';
                            }
                            resultFileData.push({
                                "Language": _fileLang,
                                "FileUrl": _fileUrl,
                                "FileName": _fileName
                            });
                        }
                        destinationData[i].Details = resultFileData;
                    } else {
                        const _getData = destinationData[i] ? destinationData[i].Details : [];
                        Object.entries(_getData).forEach(([key, value]) => {
                            const _fileName = value.split('/').pop();
                            const dataSet = { "Language": key, "FileUrl": value, "FileName": _fileName };
                            resultFileData.push(dataSet);
                        });
                        destinationData[i].Details = resultFileData;
                    }
                }
            }
        }
        return (
            <Box sx={{ m: "32px", ml: "200px", mr: "200px", display: "flex", gap: "15px", flexDirection: "column", flexGrow: "1", overflowY: 'auto' }}>
                {(hubTranaslationData.length > 0 && results) &&
                    <>
                        <div className='hideShowNewChat btn-container'>
                            <button onClick={props.createSession} title="Create New Session" className="new-chat">
                                <img src={start_chat} alt="Start Chat" />
                            </button>
                        </div>
                        <TableContainer>
                            <Table aria-label="customized table" className="tableHeadData">
                                <TableHead>
                                    <TableRow>
                                        <TableCell className='cellWidthSizeFile'>Source File</TableCell>
                                        <TableCell className='cellWidthSizeFile'>Destination Files</TableCell>
                                        <TableCell className='cellWidthSizeLang'>Destination Language</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(hubTranaslationData[0]?.operation_details || []).map((row, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            <TableCell className='cellWidthSizeFile'>
                                                <ul className="marginLeftTable">
                                                    <li onClick={() => downloadTransalatedFile(row.source_file_url, row.source_file_name)}>
                                                        <a href="javascript:void(0);">{row.source_file_name}</a>
                                                    </li>
                                                </ul>
                                            </TableCell>
                                            <TableCell className='cellWidthSizeFile'>
                                                {row.Details.map((rowDestinationName, destIndex) => (
                                                    <ul className="marginLeftTable" key={destIndex}>
                                                        {rowDestinationName && rowDestinationName.FileUrl != 'Failed to translate' ?
                                                            <li onClick={() => downloadTransalatedFile(rowDestinationName.FileUrl, rowDestinationName.FileName)}>
                                                                <a href="javascript:void(0);">{rowDestinationName.FileName}</a>
                                                            </li> :
                                                            <li>
                                                                <p>{rowDestinationName.FileName}</p>
                                                            </li>
                                                        }
                                                    </ul>
                                                ))}
                                            </TableCell>
                                            <TableCell className='cellWidthSizeLang'>
                                                {row.Details.map((rowDestinationName, langIndex) => (
                                                    <ul className="marginLeftTable" key={langIndex}>
                                                        <li>{rowDestinationName.Language}</li>
                                                    </ul>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {hubTranaslationData[0] && hubTranaslationData[0].glossary_url !== 'NA' && (
                            <TableContainer>
                                <Table aria-label="customized table" className="tableHeadData">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <strong>Glossary File Name : </strong>
                                                <a href="javascript:void(0);" onClick={() => downloadTransalatedFile(glossaryFileUrl, glossaryFileName)}>
                                                    {glossaryFileName}
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </TableContainer>
                        )}


                        {
                            (isRating && ratingDataItemsThumbs == "Down") ? <><Rating rating={onRateChange} thumbs={ratingDataItemsThumbs}></Rating></> : <></>
                        }
                        {
                            (isRating && ratingDataItemsThumbs == "Up") ? <><Rating rating={onRateChange} thumbs={ratingDataItemsThumbs}></Rating></> : <></>
                        }
                        {
                            (isRating && ratingDataItemsThumbs == "None") ? <><Rating rating={onRateChange} thumbs={'None'}></Rating></> : <></>
                        }
                        {((ratingDataItemsThumbs == "Down") || (ratingDataItemsThumbs == "Up")) ?
                            <div>
                                {!isRatingCommentEditable ?
                                    <><strong>Feedback & Suggestions (Optional)</strong><textarea
                                        id="outlined-error"
                                        placeholder='Feedback & Suggestions (Optional)'
                                        value={ratingDataItemsComments}
                                        onChange={(e) => handleChangeRatingComments(e.target.value)}
                                        ref={textareaRef}
                                        onInput={handleInput}
                                        style={{
                                            width: "97%",
                                            minHeight: "50px",
                                            resize: "none",
                                            overflow: "hidden",
                                            padding: "5px",
                                            marginTop: "10px"
                                        }}
                                    ></textarea></> :
                                    <><strong>Feedback & Suggestions (Optional)</strong><textarea
                                        id="outlined-error"
                                        placeholder='Feedback & Suggestions (Optional)'
                                        value={ratingComments}
                                        onChange={(e) => handleChangeRatingComments(e.target.value)}
                                        ref={textareaRef}
                                        onInput={handleInput}
                                        style={{
                                            width: "97%",
                                            minHeight: "50px",
                                            resize: "none",
                                            overflow: "hidden",
                                            padding: "5px",
                                            marginTop: "10px"
                                        }}
                                    ></textarea></>
                                }
                                <Button sx={{ background: "#703E97", marginTop: "10px", marginBottom: "10px", width: "150px", padding: "10px", borderRadius: "2px", backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" } }}
                                    onClick={() => submitThumbsData()} >
                                    <Typography sx={{ color: "#F3F3F3", fontWeight: "400", fontSize: "16px", fontFamily: "Open Sans", }}>
                                        {"Submit"}
                                    </Typography>
                                </Button>
                                {isRatingError ?
                                    <Alert severity="error">
                                        <AlertTitle>Feedback & Suggestions is the manadatory field.</AlertTitle>
                                    </Alert> : undefined}
                            </div> : undefined}

                    </>
                }
            </Box>
        )
    }

    const getDataNoFoundViewResult = () => {
        return (
            <Box sx={{ m: "32px", ml: "200px", mr: "200px", display: "flex", gap: "15px", flexDirection: "column", flexGrow: "1", overflowY: 'auto' }}>
                <div className='hideShowNewChat btn-container'>
                    <button onClick={props.createSession} title="Create New Session" className="new-chat">
                        <img src={start_chat} alt="Start Chat" />
                    </button>
                </div>
                <Alert severity="warning">
                    <AlertTitle>Error</AlertTitle>
                    <strong>{showingMsgDataNotFound}</strong>
                </Alert>
            </Box>
        )
    }

    return (
        <div className="translationHubBox">
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'scroll' }}>
                        <div className="hubBox">
                            {!results && getInputView()}
                            {results && !isShowingMsgDataNotFound && getInputViewResult()}
                            {results && isShowingMsgDataNotFound && getDataNoFoundViewResult()}
                        </div>
                    </Box>
                    <div>
                        <div className='divider'></div>
                        <div className='footer'>{props.globalUiText.DASHBOARD_FOOTER}</div>
                    </div>
                </>
            </Box>
        </div>
    )
}

export default TranaslationHub;