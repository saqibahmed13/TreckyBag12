import React from "react";
import open from '../../assets/open.png';
import close from '../../assets/close.png';
import start_chat from '../../assets/start_chat.png';
import more from '../../assets/more.png';
import './chathistory.css';

export default function ChatHistory(props) {
    const [selectedITem, setSelectedItem] = React.useState(!props.initLoad ? props.sessionIndex : null);
    const [showmore, setShowMore] = React.useState(false);
    const [allowEdit, setAllowEdit] = React.useState(false);

    const onEnterPress = (e, sessionID) => {
        if (e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            props.renameSession(e.target.value, sessionID);
        }
    }
    const showHistoryToggle = () => {
        props.showHistoryToggle();
    }
    const DAY = 86400000;

    let isToday = 0;
    let isYesterday = 0;
    let isWeek = 0;
    let isOlder = 0;

    React.useEffect(() => {
        if (allowEdit) {
            document.getElementById('text-' + allowEdit.split('edit-')[1]).select();
            setShowMore(false);
        }
    }, [allowEdit]);


    const getGroup = (session) => {
        if (session.timestamp != null) {
            let date = new Date(session.timestamp),
                visualDate = date.toLocaleString('en-US').split(',')[0];
            let today = new Date(),
                visualToday = today.toLocaleString('en-US').split(',')[0];
            let yesterday = new Date(today - DAY),
                visualYesterday = yesterday.toLocaleString('en-US').split(',')[0];
            let week = new Date(today - DAY * 8);
            if (visualDate == visualToday) {
                if (isToday < 1) {
                    isToday++;
                    return (<li className="group">Today</li>);
                }
            } else if (visualDate == visualYesterday) {
                if (isYesterday < 1) {
                    isYesterday++;
                    return (<li className="group">Yesterday</li>);
                }
            } else if (date >= week) {
                if (isWeek < 1) {
                    isWeek++;
                    return (<li className="group">Past 7 Days</li>);
                }
            } else {
                if (isOlder < 1) {
                    isOlder++;
                    return (<li className="group">Older</li>);
                }
            }
        }
    }

    const onRenameClick = (session) => {
        setAllowEdit('edit-' + session.user_session_id);
    }


    const onDeleteClick = (session) => {
        props.deleteSession(session.user_session_id);
    }


    return (
        <>
            <div className={props.showHistory ? "chathistory close" : "chathistory"}>
                <div className="sidebar" onClick={evt => {
                    setShowMore(false);
                    setAllowEdit(false);
                }}>
                    {
                        props.showHistory ? <div className="left-panel"><button className="show-hide-history open" onClick={showHistoryToggle} title="Open Sidebar"><img src={close}></img></button></div> : <></>
                    }

                    {!props.showHistory &&
                        <>
                            <div className="btn-container">
                                <button onClick={() => {
                                    props.createSession();
                                }} title="Create New Session" className="new-chat"><img src={start_chat}></img></button>
                                <button className="show-hide-history" onClick={showHistoryToggle} title="Close Sidebar"><img src={open}></img></button>
                                <p className="chat-txt">Chat Session History</p>
                            </div>
                            <div className="sidebar-content">
                                <ul className="lists">
                                    {
                                        props.chatSessions.map((session, index) => (
                                            <React.Fragment key={`session-${session.user_session_id}`}>
                                                {props.config.groupBy ? getGroup(session, index) : null}
                                                <li
                                                    onClick={() => {
                                                        setSelectedItem(index);
                                                        props.updateSession(index);
                                                    }}
                                                    className={selectedITem === index ? 'list active' : 'list'}
                                                    key={`selection-${session.user_session_id}`}
                                                    role="option"
                                                    aria-selected="false"
                                                >
                                                    <a href="#" className="nav-link">
                                                        {allowEdit === `edit-${session.user_session_id}` ? (
                                                            <textarea className="link active"
                                                                onKeyDown={(el) => onEnterPress(el, session.user_session_id)}
                                                                defaultValue={session.user_session_name.split('"').join('')}
                                                                onClick={(e) => e.stopPropagation()}
                                                                id={`text-${session.user_session_id}`}
                                                            />
                                                        ) : (
                                                            <textarea className="link"
                                                                onKeyDown={(el) => onEnterPress(el, session.user_session_id)}
                                                                defaultValue={session.user_session_name.split('"').join('')}
                                                                readOnly
                                                            />
                                                        )}
                                                    </a>
                                                    <button className="show-more" onClick={(e) => {
                                                        if (showmore === `sm-${session.user_session_id}`) {
                                                            setShowMore(false);
                                                            setAllowEdit(false);
                                                        } else {
                                                            setShowMore(`sm-${session.user_session_id}`);
                                                        }
                                                        e.stopPropagation();
                                                    }}>
                                                        <img src={more} alt="more" />
                                                    </button>
                                                    {showmore === `sm-${session.user_session_id}` && (
                                                        <div className="more-dropdown" key={`dropdown-${session.user_session_id}`}>
                                                            <div className="more-row" onClick={(e) => {
                                                                onRenameClick(session);
                                                                e.stopPropagation();
                                                            }}>Rename</div>
                                                            <div className="more-row" onClick={(e) => {
                                                                onDeleteClick(session);
                                                                e.stopPropagation();
                                                            }}>Delete</div>
                                                        </div>
                                                    )}
                                                </li>
                                            </React.Fragment>
                                        ))
                                    }
                                </ul>
                                {/* <ul className="lists">
                                    {
                                        props.chatSessions.map((session, index) => {
                                            return (
                                                <>
                                                    {
                                                        props.config.groupBy ? getGroup(session) : ''
                                                    }
                                                    <li
                                                        onClick={() => {
                                                            setSelectedItem(index);
                                                            props.updateSession(index);
                                                        }}
                                                        className={selectedITem == index ? 'list active' : 'list'}
                                                        key={'selection-' + index}
                                                        role="option"
                                                        aria-selected="false">
                                                        <a href="#" className="nav-link">
                                                            {
                                                                'edit-' + session.user_session_id == allowEdit ?
                                                                    <textarea className="link active" onKeyDown={(el) => {
                                                                        onEnterPress(el, session.user_session_id);
                                                                    }} defaultValue={session.user_session_name.split('"').join('')}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                        }} id={'text-' + session.user_session_id}
                                                                    ></textarea> :
                                                                    <textarea className="link" onKeyDown={(el) => {
                                                                        onEnterPress(el, session.user_session_id);
                                                                    }} defaultValue={session.user_session_name.split('"').join('')} readOnly></textarea>
                                                            }

                                                        </a>
                                                        <button className="show-more" onClick={(e) => {
                                                            if (showmore == 'sm-' + session.user_session_id) {
                                                                setShowMore(false);
                                                                setAllowEdit(false);
                                                            } else {
                                                                setShowMore('sm-' + session.user_session_id);
                                                            }
                                                            e.stopPropagation();
                                                        }}>
                                                            <img src={more}></img>
                                                        </button>
                                                        {
                                                            showmore == 'sm-' + session.user_session_id ? <div className="more-dropdown" key={"sm-" + session.user_session_id}>
                                                                <div className="more-row" onClick={(e) => {
                                                                    onRenameClick(session);
                                                                    e.stopPropagation();
                                                                }}>Rename</div>
                                                                <div className="more-row" onClick={(e) => {
                                                                    onDeleteClick(session);
                                                                    e.stopPropagation();
                                                                }}>Delete</div>
                                                            </div> : <></>
                                                        }

                                                    </li>
                                                </>
                                            )
                                        })
                                    }
                                </ul> */}
                            </div>
                        </>
                    }
                </div>
            </div>
        </>
    )
}