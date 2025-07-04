import React from 'react';
import './sdlcChat.css';
import logo from '../../assets/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCheckCircle, faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
 
 
const SdlcIncoming = props => {
 
 
    const [optionSelected, setOptionSelected] = React.useState('');
 
    const handleRadioChange = (e) => {
        setOptionSelected(e.target.value);
        props.postAnswer(e.target.value);
    };
 
    const handleGenerateDocument = async () => {
        props.loaded(false);
        const blobURL = await props.getQuestion(null, true);
        props.postQuestion(blobURL);
    }
 
 
    const handleDownload = () => {
        props.downloadDocument();
    }
 
    const handleYesUpload = async () => {
        props.handleYesUpload();
    }
 
    const handleNoUpload = () => {
        props.handleNoUpload();
    }
 
    return (
        <li className="chat incoming">
 
            <span className="logo"><img src={logo} alt="VC" /></span>
 
            <p>
                <div className="tooltipMessage">
                    <div className="content">
                        {Array.isArray(props.msg) ? (
                            <div className="structured-msg">
                                {props.msg.map(({ key, value }, idx) => (
                                    <div key={idx}>
                                        <span className="chat-key">{key}</span>: <span className="chat-value">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span>{props.msg}</span>
                        )}
                        {props.tooltipText ?
                            <>
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    data-tooltip-id="msg-tooltip"
                                    data-tooltip-content={props.tooltipText}
                                    style={{ marginLeft: '8px', cursor: 'pointer', color: '#703E97' }}
                                />
                                <Tooltip id="msg-tooltip" place="top" />
                            </>
                            : null}
                    </div>
                </div>
                {props.showConfirmationMsg && (
                    <div className="confirmation-section">
                        <label className="label-heading">
                            <a href="#!" onClick={handleGenerateDocument}>
                                Click here to generate the document with the above provided details.
                            </a>
                        </label>
                    </div>
                )}
 
                {props.showDownloadBtn && (
                    <div className="download-section">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDownload();
                            }}
                            className="download-link"
                        >
                            <FontAwesomeIcon icon={faDownload} className="download-icon" />
                            Download
                        </a>
                    </div>
                )}
                {props.showRadioBtn && (
                    <div className="radio-group">
                        {props.radioBtnOptions.map((option, index) => {
                            const value = typeof option === 'object' ? option.value : option;
                            const label = typeof option === 'object' ? option.label : option;
 
                            return (
                                <label key={index}>
                                    <input
                                        type="radio"
                                        value={value}
                                        checked={optionSelected === value}
                                        onChange={handleRadioChange}
                                        disabled={optionSelected !== ''}
                                    />
                                    {label}
                                </label>
                            );
                        })}
                    </div>
                )}
 
                {props.uploadOption && (
                    <div className="confirmation-section">
                        <div className="confirmation-buttons">
                            <button className="yes-btn" onClick={handleYesUpload}>
                                <FontAwesomeIcon icon={faCheckCircle} className="btn-icon" />
                                Yes
                            </button>
                            <button className="no-btn" onClick={handleNoUpload}>
                                <FontAwesomeIcon icon={faTimesCircle} className="btn-icon" />
                                No
                            </button>
                        </div>
                    </div>
                )}
 
            </p>
 
        </li>
    )
}
 
export default SdlcIncoming;