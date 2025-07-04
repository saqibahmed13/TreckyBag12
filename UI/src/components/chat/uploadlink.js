import link from '../../assets/upload_link.png';
import API from '../../utils/api.service';
import { toast } from'react-toastify';

const UploadLink = (props) => {
    const file_blob_url = encodeURIComponent(props.file.url);

    const handleDownload = () => {
        API.DOWNLOAD(props.baseURL, `download?file_blob_url=${file_blob_url}&user_email=${props.user_email}&domain=${props.domain}`,
        props.file.filename,
        (res)=>{
            toast.success("File downlaoded successfully!", {
                position: toast.POSITION.TOP_RIGHT,
                hideProgressBar: true,
                autoClose: 2000,
                closeButton: false
              });
        }, (err) => {console.log(err);});
    }
    return (
        <div className='uploaded-link-wrapper'>
            <div className='uploaded-link-desc'>
                <p>{props.globalUiText.UPLOAD_TEXT}</p>
            </div>
            <div className='upload-link'>
                <button onClick={()=>{handleDownload()}} className='no-style'><img src={link}></img></button> <p className='link-name'>{props.file.filename}</p>
            </div>
        </div>
    )
}

export default UploadLink;