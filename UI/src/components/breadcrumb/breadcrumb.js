import './breadcrumb.css';

function Breadcrumb(props) {
    return (
        <ul className="breadcrumb">
            {props.uiText.DASHBOARD_LABEL ? <li><a href="/">{props.uiText.UC_DASHBOARD_LABEL??  props.uiText.DASHBOARD_LABEL}</a></li> : <></>}
            {props.uiText.CHAT_LABEL ? <li><a href="#" className='active disable'>{props.uiText.CHAT_LABEL}</a></li>: <></>}
        </ul>
    )
}

export default Breadcrumb;