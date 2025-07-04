import React, { useState } from 'react';
import API from '../../utils/api.service';
import downloadIcon from '../../assets/download.png';
import { toast } from'react-toastify';

const FileDownload = (props) => {

    const data = {
        "file_blob_url": props.docUrl,
    }

    const downloadFile = () => {
        const file_blob_url = encodeURIComponent(props.docUrl);
        
        API.DOWNLOAD(props.baseURL, `download?file_blob_url=${file_blob_url}&user_email=${props.user_email}&domain=${props.domain}`,
        "generated_docoment.docx",
        (res)=>{
            toast.success("File downlaoded successfully!", {
                position: toast.POSITION.TOP_RIGHT,
                hideProgressBar: true,
                autoClose: 2000,
                closeButton: false
              });
        }, (err) => {console.log(err);});
    };

    return (
        <button onClick={()=>{downloadFile();}} className='copy-btn'><img src={downloadIcon}></img> Download</button>
    );
};

export default FileDownload;
