// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import parse from 'html-react-parser';
import './error.css';
import notfound from '../../assets/error-illustration.svg';
import domainNotfound from '../../assets/not-found-illustration.svg';
import accessDenied from '../../assets/Access_Denied.png';

function Error(props) {

    return (
        <div className='error-overlay'>
            <div className='inner-wrapper'>
                {
                    props.errorType == 1 ?
                        <>
                            <img src={notfound}></img>
                            <p><strong>{parse(props.uiText.ERROR_NOT_FOUND)}</strong></p>
                            {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>{props.uiText.ERROR_NOT_FOUND_DESC}</ReactMarkdown> */}
                            <p>{parse(props.uiText.ERROR_NOT_FOUND_DESC)}</p>
                        </> :
                        props.errorType == 2 ?
                            <>
                                <img src={domainNotfound}></img>
                                <p><strong>It looks like you don’t have access to ChatViatris yet. To request access, please visit the <a href="https://myl.sharepoint.com/teams/ViatrisAIHub/SitePages/ChatViatrisCOE-Resources.aspx#requesting-access-to-chatviatris"
                                    target="_blank" rel="noopener noreferrer" style={{ fontWeight: "bold", margin: "0 5px" }}> ChatViatris COE page </a> for more information and next steps.</strong></p>
                                {/* <p><strong>{parse(props.uiText.ERROR_DOMAIN_ERROR)}</strong></p>
                                <p>{parse(props.uiText.ERROR_DOMAIN_ERROR_DESC)}</p> */}
                            </> :
                            props.errorType == 3 ?
                                <>
                                    <img src={accessDenied}></img>
                                    <p><strong>{parse(props.uiText.ERROR_DOMAIN_ACCESS_ERROR)}{props.domainAllias}</strong></p>
                                    {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>{props.uiText.ERROR_DOMAIN_ACCESS_ERROR_DESC}</ReactMarkdown> */}
                                    <p>{parse(props.uiText.ERROR_DOMAIN_ACCESS_ERROR_DESC)}</p>
                                </> : <></>
                }

            </div>

        </div>
    )
}

export default Error;