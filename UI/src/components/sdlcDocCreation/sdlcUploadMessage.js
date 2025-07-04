import folder from '../../assets/folder-closed.png';
 
function SdlcUploadMessage(props) {
    return (
        <li className="chat outgoing uploadmessage">
            <p>
            <div className='file-name-cont'><img src={folder}></img><span>{props.filename}</span></div>
            <div className='status'><strong>{props.status}</strong></div>
            </p>
            <span className="logo-out">{props.user}</span>
        </li>
    )
}
 
export default SdlcUploadMessage;