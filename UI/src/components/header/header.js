import React from 'react';
import './header.css';
import logo from '../../assets/logo.png';
import user_guide from '../../assets/user_guide.png';
import Breadcrumb from '../breadcrumb/breadcrumb';
import Menu from '../menu/menu';
import Dropdown from '../dropdown/dropdown';

function Header(props) {
    const [sessionName, setSessionName] = React.useState(props.sessionName);
    const menuList = [];

    props.useCases.USECASES.map((value, index) => {
        menuList.push(value.NAME);
    });

    const user = props.userName();
    const domainList = props.domainlist;
    const metaTagList = props.metaTagList;
    const resetMetaTags = props.resetMetaTags;
    const handleResetMetaTag = props.handleResetMetaTag;
    const useCaseChatBot = props.useCaseChatBot;
    const handleSupportBot = props.handleSupportBot;

    return (
        <>
            <nav className="navbar">
                <a href='/'>
                    <img src={logo} alt="CV" />
                    <h2>ChatViatris</h2>
                </a>
                <div className='user-guide'><a href={props.globalUiText.HELP_URL} target='_blank'><img src={user_guide}></img></a></div>
                <Menu menulist={props.useCases.USECASES} menu={props.uiText.CHAT_LABEL}></Menu>
                {props.errorType == 0 ? <p className='session name'>{sessionName}</p> : <></>}
                <div className='user'>{user}</div>

            </nav>
            {!props.loadDashboard ?
                <div className='domain-cont'>
                    <Breadcrumb uiText={props.uiText}></Breadcrumb>
                    <Dropdown setURIDomain={props.setURIDomain} domain={props.domain} domainlist={domainList} key={props.domainlist} domainAllias={props.domainAllias} metaTagList={metaTagList} handleSelectedTagValues={props.handleSelectedTagValues} selectedTagValues={props.selectedTagValues} resetMetaTags={resetMetaTags} handleResetMetaTag={handleResetMetaTag} useCaseChatBot={useCaseChatBot} handleSupportBot={handleSupportBot}></Dropdown>
                </div> : <></>
            }
        </>
    )
}

export default Header;