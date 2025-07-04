import './acknowledge.css';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    color: '#2A276E',
    maxHeight: 600,
    overflow: 'auto'
};

const p_style = {
    color: '#000',
    paddingLeft: '7px',
    paddingBottom: '20px'
}

const b_style = {
    color: '#2A276E',
    border: '1px solid',
    borderRadius: '20px',
    padding: '5px 20px',
    margin: 'auto',
    display: 'block',
    bgcolor: '#F0E9F4'
}

function Acknowledge(props) {

    const [open, setOpen] = React.useState(true);
    const handleClose = () => {
        props.onAcknowledge(()=>{
            setOpen(false);
        });
    }

    const [checked, setChecked] = React.useState(false);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    return (
        <>
            {
                open ?
                    <div className='acknowledge-overlay'>
                        <div>
                            <Box sx={style}>
                                <Typography id="keep-mounted-modal-title" variant="h6" component="h2" sx={{ color: '#2A276E', fontSize: '1.5rem' }}>
                                    Important Information When Using ChatViatris
                                </Typography>
                                <br></br>
                                <Typography id="keep-mounted-modal-description" sx={p_style}>
                                    <p>This ChatViatris Generative AI Application (&quot;the Application&quot;) collects data directly provided by you and generated through your interactions. This data is used to improve and personalize the services offered by the Application. For more information about how Viatris collects and uses information about you, please see <a href="https://myl.sharepoint.com/:b:/r/sites/Policies/Global Viatris Policies/Privacy/Employee Fair Processing Notice.pdf?" target="_blank">Employee Fair Processing Notice</a>. </p>
                                    <br></br>
                                    <Typography id="keep-mounted-modal-title" variant="h6" component="h2" sx={{ color: '#2A276E', fontSize: '1.3rem' }}>
                                    When using the Application, please keep in mind the following guidelines:
                                    </Typography>
                                    <br></br>
                                    <ol>
                                        <li><p><strong>Verify Output:</strong> Confirm the accuracy of the Application’s output before relying on it. </p>
                                        </li>
                                        <li><p><strong>No Confidential Information:</strong> Do not input Viatris confidential information. </p>
                                        </li>
                                        <li><p><strong>No Personal Information:</strong> Do not input personal information about anyone. </p>
                                        </li>
                                        <li><p><strong>Check for Bias:</strong> Ensure the Application’s output does not produce biased content. </p>
                                        </li>
                                        <li><p><strong>Avoid Malicious Content:</strong> Do not use the Application to create malicious content. </p>
                                        </li>
                                        <li><p><strong>Prohibited Content:</strong> Do not generate content unrelated to Viatris business. </p>
                                        </li>
                                        <li><p><strong>Disclose AI Use:</strong> Disclose AI-generated content that has not been reviewed and further revised by a human.  Always be transparent when relying on AI-generated content. </p>
                                        </li>
                                        <li><p><strong>Credit Sources:</strong> If the AI cites sources, ensure you credit those sources when using AI-generated content. </p>
                                        </li>
                                        <li><p><strong>Data Retention:</strong> Conversation history is retained for 1 year within Viatris and not shared with any 3rd parties. </p>
                                        </li>
                                    </ol>
                                    <p>By using the Application, you acknowledge and agree to follow these guidelines. If you have questions, please contact <a href="mailto:global-chatviatris-support@viatris.com">Global Chatviatris Support</a> </p>
                                </Typography>
                                <FormControlLabel required control={<Checkbox onChange={handleChange} />} label="I confirm that I follow the above mentioned terms." />
                                <Button onClick={handleClose} sx={b_style} disabled={!checked}>Submit</Button>
                            </Box>
                        </div>
                    </div>
                    : <></>
            }
        </>
    )
}

export default Acknowledge;