import React from 'react';
// import Markdown from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './chat.css';
import logo from '../../assets/logo.png';
import copy from '../../assets/copy.svg';
import Rate from './rate';
import Context from './context';
import DisplayCode from './DisplayCode'
import { toast } from 'react-toastify';
import { Button, Typography } from '@mui/material';
import { getSasToken, handleDownload } from '../DataInsights/Utility/Util';
import FileDownload from './download';

const Incoming = props => {

    const [shouldMarkdown, setShouldMarkdown] = React.useState(false);

    const formatTimeStamp = timestamp => {
        if (timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString('en-US')
        }
    }

    const onRateChange = (rate) => {
        props.rating({
            'rating': rate,
            'rateID': props.rateID
        });
    }

    const getContent = (event) => {
        if (event.target.className !== "copy-btn") return;

        if (shouldMarkdown) {
            let obj = <ReactMarkdown>{props.msg}</ReactMarkdown>;
            navigator.clipboard.writeText(obj['props']['children']);
        } else {
            const target = event.target;
            const parent = target.parentElement;
            const content = parent.getElementsByClassName('content');
            let data = null;

            for (let i = 0; i < content.length; i++) {
                if (content[i].innerText.length) data = content[i].innerText;
            }

            data = data.replace(/\s/g, "_");
            data = data.replaceAll("_______", "\n\n");
            data = data.replaceAll("______", "\n\n");
            data = data.replaceAll("_____", "\n\n");
            data = data.replaceAll("___", "");
            data = data.replaceAll("_", " ");

            navigator.clipboard.writeText(data);

            // console.log(data);
            // console.log(props.msg);
        }

        toast.success(props.globalUiText.TEXT_COPIED_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
        });
    }

    const sasToken = getSasToken();

    const processMarkdown = (data) => {
        // let regex = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\((https:\/\/[^\)]+)\))/gi

        // let links = [...data.matchAll(regex)].map((m) => ({ text: m[1], link: m[2] }))

        // console.log(links);

        return data;
    }

    React.useEffect(() => {
        if (props) {
            let anchors = document.querySelectorAll('.incoming a');

            for (var i = 0; i < anchors.length; i++) {
                anchors[i].setAttribute('target', '_blank');
            }
        }
    }, [props]);

    return (
        <li className="chat incoming">

            <span className="logo"><img src={logo} alt="VC" /></span>

            {
                props.imageUrl &&

                <p className='content'>
                    <img src={`${props.imageUrl}?${sasToken}`} style={{ maxWidth: "100%" }}></img>

                    <Button variant='text' sx={{ width: "200px", justifyContent: 'left', alignItems: 'center' }} onClick={() => handleDownload(`${props.imageUrl}?${sasToken}`)}>
                        <Typography sx={{ color: "#474747", padding: '10px', ml: "10", fontWeight: "400", fontSize: "12px", fontFamily: "Open Sans", mb: "10" }}>
                            Download
                        </Typography>
                    </Button>
                </p>

            }

            {!props.imageUrl &&
                <p>
                    <p className='content'>
                        <div className="markdown-table-container">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{processMarkdown(props.msg)}</ReactMarkdown>
                        </div>
                    </p>
                    <p className='content'><DisplayCode code={props.code} /></p>

                    {
                        props.link.length ? <><Context file={props.link}></Context></> : <></>
                    }

                    {
                        props.rate == 'true' ? <><Rate rating={onRateChange} thumbs={props.thumbs}></Rate></> : <></>
                    }
                    {
                        props.rate == 'true' ? <button onClick={getContent} className='copy-btn'><img src={copy}></img> Copy</button> : <></>
                    }
                    {
                        props.docUrl &&
                        <FileDownload docUrl={props.docUrl} baseURL={props.baseURL} domain={props.domain} user_email={props.user_email}></FileDownload>
                    }

                </p>
            }
            <span className='time-stamp'>{props.rate == 'true' ? formatTimeStamp(props.timestamp) : ''}</span>
        </li>
    )
}

export default Incoming;