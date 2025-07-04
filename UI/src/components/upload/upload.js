import React from 'react';
import Files from 'react-files';
import { toast, ToastContainer } from 'react-toastify';
import './upload.css';


const Upload = (props) => {
  const handleChange = (files) => {
    if (files && files.length > 0) {
      props.upload(files[0]);
    }
  }

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
    <div className="files">
      <Files
        className='files-dropzone'
        dragActiveClassName="files-dropzone-active"
        onChange={handleChange}
        onError={handleError}
        accepts={['.txt', '.pdf', '.docx','.pptx']}
        // multiple
        // maxFileSize={10000000}
        //minFileSize={0}
        >
        
      </Files>
    </div>
  )
}

export default Upload;