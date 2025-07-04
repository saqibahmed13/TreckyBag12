export default function Context(props) {
    const fileList = props.file.map((file, index) => {
        const getFileData = file ? file.fileurl : "";
        const getFileUrl = new URL(getFileData).pathname.split("/").filter(part => part.includes("kb_knowledge.do"))[0] || "Not found";
        if (props.file.length > 0) {
            if (props.file.length - 1 === index) {
                if (file.filetype === 'pdf') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-pdf" aria-hidden="true"></i> {file.filename}
                            </a>
                        </span>
                    );
                } else if (file.filetype === 'pptx') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-powerpoint" aria-hidden="true"></i> {file.filename}
                            </a>
                        </span>
                    );
                } else if (file.filetype === 'docx' || file.filetype === 'doc') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-word" aria-hidden="true"></i> {file.filename}
                            </a>
                        </span>
                    );
                } else if (file.filetype === 'txt') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-text" aria-hidden="true"></i> {file.filename}
                            </a>
                        </span>
                    );
                } else if (file.filetype === 'mp3' || file.filetype === 'wav') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-audio" aria-hidden="true"></i> {file.filename}
                            </a>
                        </span>
                    );
                } else if (file.filetype === 'mp4') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-video" aria-hidden="true"></i> {file.filename}
                            </a>
                        </span>
                    );
                } else if (getFileUrl === 'kb_knowledge.do') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-text" aria-hidden="true"></i> {file.kb_number}
                            </a>
                        </span>
                    );
                }
            } else {
                if (file.filetype === 'pdf') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-pdf" aria-hidden="true"></i> {file.filename}
                            </a>,{" "}
                        </span>
                    );
                } else if (file.filetype === 'pptx') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-powerpoint" aria-hidden="true"></i> {file.filename}
                            </a>,{" "}
                        </span>
                    );
                } else if (file.filetype === 'docx' || file.filetype === 'doc') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-word" aria-hidden="true"></i> {file.filename}
                            </a>,{" "}
                        </span>
                    );
                } else if (file.filetype === 'txt') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-text" aria-hidden="true"></i> {file.filename}
                            </a>,{" "}
                        </span>
                    );
                } else if (file.filetype === 'mp3' || file.filetype === 'wav') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-audio" aria-hidden="true"></i> {file.filename}
                            </a>,{" "}
                        </span>
                    );
                } else if (file.filetype === 'mp4') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-video" aria-hidden="true"></i> {file.filename}
                            </a>,{" "}
                        </span>
                    );
                } else if (getFileUrl === 'kb_knowledge.do') {
                    return (
                        <span key={index}>
                            <a href={file.fileurl} target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-file-text" aria-hidden="true"></i> {file.kb_number}
                            </a>
                        </span>
                    );
                }
            }
        }
        return null;
    });

    return (
        <>
            <span className="reference">
                <span className="ref-text">
                    <strong>References:</strong>
                </span>
                <span className="inner-container">{fileList}</span>
            </span>
        </>
    );
}