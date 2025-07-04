import React from "react";
import open from '../../assets/open.png';
import close from '../../assets/close.png';
import start_chat from '../../assets/start_chat.png';
import more from '../../assets/more.png';
import API from "../../utils/api.service";
import './tranaslationHub.css';

const TranaslationHubHistory = (props) => {
    const [selectedHubITem, setSelectedHubItem] = React.useState(!props.initLoad ? props.sessionIndex : null);
    const [showMoreHub, setShowMoreHub] = React.useState(false);
    const [allowEditHub, setAllowEditHub] = React.useState(false);

    React.useEffect(() => {
        if (allowEditHub) {
            document.getElementById('text-' + allowEditHub.split('edit-')[1])?.select();
            setShowMoreHub(false);
        }
    }, [allowEditHub]);

    const showHistoryTranaslationHubToggle = () => {
        props.showHistoryTranaslationHubToggle();
    };

    const onEnterPress = (e, sessionID) => {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            props.renameTranaslationHubSession(e.target.value, sessionID);
        }
    };

    const getGroup = (() => {
        let groups = {};
        return (session) => {
            if (!session.timestamp) return null;

            let date = new Date(session.timestamp);
            let today = new Date();
            let yesterday = new Date(today - 86400000);
            let week = new Date(today - 86400000 * 7);

            let visualDate = date.toLocaleDateString('en-US');
            let visualToday = today.toLocaleDateString('en-US');
            let visualYesterday = yesterday.toLocaleDateString('en-US');

            let groupLabel = "Older";
            if (visualDate === visualToday) groupLabel = "Today";
            else if (visualDate === visualYesterday) groupLabel = "Yesterday";
            else if (date >= week) groupLabel = "Past 7 Days";

            if (!groups[groupLabel]) {
                groups[groupLabel] = true;
                return <li key={groupLabel} className="group">{groupLabel}</li>;
            }
            return null;
        };
    })();

    return (
        <div className={props.showTranasltionHistory ? "chathistory close" : "chathistory"}>
            <div className="sidebar" onClick={() => { setShowMoreHub(false); setAllowEditHub(false); }}>
                {props.showTranasltionHistory && (
                    <div className="left-panel">
                        <button className="show-hide-history open" onClick={showHistoryTranaslationHubToggle} title="Open Sidebar">
                            <img src={close} alt="Close Sidebar" />
                        </button>
                    </div>
                )}
                {!props.showTranasltionHistory && (
                    <>
                        <div className="btn-container">
                            <button onClick={props.createSession} title="Create New Session" className="new-chat">
                                <img src={start_chat} alt="Start Chat" />
                            </button>
                            <button className="show-hide-history" onClick={showHistoryTranaslationHubToggle} title="Close Sidebar">
                                <img src={open} alt="Open Sidebar" />
                            </button>
                            <p className="chat-txt">Session History</p>
                        </div>
                        <div className="sidebar-content">
                            <ul className="lists">
                                {props.tranaslationSessions.map((session, index) => (
                                    <React.Fragment key={session.user_session_id || index}>
                                        {props.config.groupBy && getGroup(session)}
                                        <li
                                            onClick={() => {
                                                setSelectedHubItem(index);
                                                props.updateSession(index);
                                            }}
                                            className={selectedHubITem === index ? 'list active' : 'list'}
                                            key={`selection-${session.user_session_id || index}`}
                                            role="option"
                                            aria-selected={selectedHubITem === index}
                                        >
                                            <a href="#" className="nav-link">
                                                {allowEditHub === `edit-${session.user_session_id}` ? (
                                                    <textarea
                                                        className="link active"
                                                        onKeyDown={(el) => onEnterPress(el, session.user_session_id)}
                                                        defaultValue={session.user_session_name.replace(/"/g, '')}
                                                        onClick={(e) => e.stopPropagation()}
                                                        id={`text-${session.user_session_id}`}
                                                    ></textarea>
                                                ) : (
                                                    <textarea
                                                        className="link"
                                                        onKeyDown={(el) => onEnterPress(el, session.user_session_id)}
                                                        defaultValue={session.user_session_name.replace(/"/g, '')}
                                                        readOnly
                                                    ></textarea>
                                                )}
                                            </a>
                                            <button className="show-more" onClick={(e) => {
                                                setShowMoreHub(showMoreHub === `sm-${session.user_session_id}` ? false : `sm-${session.user_session_id}`);
                                                e.stopPropagation();
                                            }}>
                                                <img src={more} alt="More Options" />
                                            </button>
                                            {showMoreHub === `sm-${session.user_session_id}` && (
                                                <div className="more-dropdown" key={`sm-${session.user_session_id}`}>
                                                    <div className="more-row" onClick={(e) => {
                                                        setAllowEditHub(`edit-${session.user_session_id}`);
                                                        e.stopPropagation();
                                                    }}>Rename</div>
                                                    <div className="more-row" onClick={(e) => {
                                                        props.deleteTranaslationHubSession(session.user_session_id);
                                                        e.stopPropagation();
                                                    }}>Delete</div>
                                                </div>
                                            )}
                                        </li>
                                    </React.Fragment>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TranaslationHubHistory;
