function SdlcOutgoing(props) {
    return (
        <li className="chat outgoing">
            <p>{props.msg}</p>
            <span className="logo-out">{props.user}</span>
        </li>
    )
}
 
export default SdlcOutgoing;