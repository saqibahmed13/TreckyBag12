import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './sdlcPrompt.css';
import close from '../../assets/close.png';
import chatbot from '../../assets/chatbot.png';
 
const SdlcPrompt = (props) => {
 
 
    const processMarkdownData = (data) => {
        let noQuotesParagraph = data?.replace(/^`|`$/g, '');
        return noQuotesParagraph;
    }
 
    return (
        <div className='prompt-wrapper'>
            <div className='prompt-i-w'>
                <div className='prompt-desc-cont'>
                    <div className='prompt-inner-wrapper'>
                        <div className='icon'>
                            <img src={chatbot} alt="chatbot"></img><p className='name'>{props.alliasName}</p>
                        </div>
                        <div className='desc'>
                            <p className='dsc'>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} children={processMarkdownData(props.uiText.CHAT_DESC)}
                                    components={{
                                        a: ({ node, ...props }) => (
                                            <a {...props} target="_blank" rel="noopener noreferrer">
                                                {props.children}
                                            </a>
                                        ),
                                    }}>{processMarkdownData(props.uiText.CHAT_DESC)}</ReactMarkdown>
                            </p>
                        </div>
                    </div>
                </div>
                <ul>
                    {
                        props.promptQuest.map((value, index) => value !== "" && (
                            <li className="prompt" key={`${value}-${index}`} onClick={() => props.setPrompt()}>
                                <p>{value}</p>
                                <img src={close} alt="close" />
                            </li>
                        ))
                    }
                </ul>
            </div>
 
        </div>
    )
}
 
export default SdlcPrompt;