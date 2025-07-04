import { Box, Button, TextField, Typography, Grid, Dialog, DialogContent, DialogTitle, FormControl, MenuItem, Select, Alert, AlertTitle } from '@mui/material'
import classes from './InsightsContainer.module.css'
import { useContext, useState } from 'react'
import downloadIcon from './assets/downloadIcon.png' 
import insightsBlueIcon from './assets/insightsBlue.svg'
import goBackIcon from './assets/goBack.png'
import questionIcon from './assets/questionIcon.svg'
import discoverIcon from './assets/discoverWhite.svg'
import { getSasToken, handleDownload } from './Utility/Util';
import { DataInsightsContext } from './DataInsightsContext';
import API from '../../utils/api.service';

const Insights = (props) => {
    const dataInfo = useContext(DataInsightsContext)
    const uiLabel = dataInfo.configLabels["Insights"]
    const configLabels = dataInfo.appConfigLabels

    const [question, setQuestion] = useState("")
    const [showExample, setShowExample] = useState(false)
    const [showError, setShowError] = useState(false)

    const [results, setResults] = useState(false)

    const [response, setResponse] = useState(null)
    const [errorMsg, setErrorMsg] = useState("")


const sasToken = getSasToken()

const submit = () => {
    const submitPath =  "/insight/" + props.sessionID +'?user_email=' + `${props.userEmail}`+'&domain=' + `${props.domain}`

        const data = {
            "Human": question,
            "domain": props.domain
        }

        dataInfo.setLoading(true)


        API.POST(props.baseUrl, 
            submitPath,
            data,
            (response) => {
                if(response.data.AI.is_relevant) {
                    setResults(true)
                    setResponse(response.data.AI)
                    dataInfo.setLoading(false)
                } else {
                    dataInfo.setLoading(false)
                    setErrorMsg(configLabels["IrrevalantQuestion"])
                    setShowError(true)
                }
            },
            (error) => {
                dataInfo.setLoading(false)
                setErrorMsg(uiLabel["ServiceFailed"])
                setShowError(true)
            }
        )

}

const getPopOverView = () => {
    const insightQues = JSON.parse(configLabels["ExampleQuestionInsight"])
    const questions = insightQues?.QUESTIONS ?? [];
    return (
        <Dialog sx={{"& .MuiDialog-paper": {
            borderRadius: "50px", 
            display: 'flex', 
            flexDirection: 'column',
            background: '#E8E8E8',
            width: '650px',
            minHeight: '300px',
            height: 'fit-content'
          },}} onClose={e => setShowExample(false)} open={showExample}>
            <DialogTitle sx={{mt: '2rem', textAlign: 'center', justifyContent: 'space-between', display: 'flex'}}>
               
                <p>{uiLabel["ExampleQuestion"]}</p> 
               <Button variant= 'text' onClick={e => setShowExample(false)} sx={{textTransform:'capitalize'}}>close</Button> 
            </DialogTitle>
            <DialogContent sx={{background: '#E8E8E8'}}>
                {
                    questions.map((item) => (
                        <Typography sx={{color: "#474747", display:"flex", overflowY: "scroll", whiteSpace:'pre-line', fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                            {item}
                        </Typography>
                    ))
                }
            </DialogContent>
        </Dialog>
    )
}

const getInputView = () => {
    return (
        <Box sx={{mt:'40px', ml: "200px", mr:"200px", display:"flex", gap: "15px", flexDirection: "column", height: "100%"}}>

            <Box sx={{display:"flex", gap:'5px', background:'#F0E9F4', flexDirection: "column", width: "100%", height: '100px', paddingLeft:'10px', overflowY:'auto'}}>
                <Box sx={{display:"flex", m:'5px', color:'#F0E9F4', flexDirection: "row", alignItems:'center'}}>
                    <img src={insightsBlueIcon} height={'25px'} color='#703E97'/>
                    <Typography sx={{color: "#703E97", padding:'5px', fontWeight:"700", fontSize:"20px", fontFamily: "Open Sans"}}>
                    {uiLabel["Insights_Label"]}
                    </Typography>
                </Box>
                <Typography sx={{color: "#474747", padding:'5px', fontWeight:"400", fontSize:"15px", fontFamily: "Open Sans"}}>
                    {uiLabel["Insights_Description"]}
                </Typography>
            </Box>

            {showError &&
             <Alert severity="warning">
                 <AlertTitle>Error</AlertTitle>
                    {errorMsg}
            </Alert>}

        <Box sx={{justifyContent:"space-between", display:"flex", alignItems:'center', flexDirection: "row", mb: '-10px', width: "100%"}}>
            <Typography sx={{color: "#703E97", fontWeight:"700", fontSize:"13px", fontFamily: "Open Sans", textTransform: 'uppercase'}}>
            {uiLabel["QuestionTitle"]}
                <span style={{color: "#703E97", fontWeight:"700", fontSize:"12px", fontFamily: "Open Sans", textTransform: 'uppercase'}}>    (Optional)</span>
            </Typography>
            <Button variant= 'text' onClick={(e) => { setShowExample(true) }} sx={{textTransform:'capitalize'}}>
                    <img src={questionIcon}/>
                    <Typography paddingLeft={'5px'} sx={{color: "#703E97"}} onClick = {(e) => { setShowExample(true) }} >
                    {uiLabel["ExampleQuestion"]}
                    </Typography>
                </Button>
        </Box>

        <TextField placeholder='Enter*' sx={{width: "100%", background:"#9982ab1a"}}
            value={question}
            onChange={(e) => 
              setQuestion(e.target.value)
            } 
        />

        <Box sx={{justifyContent:'end', alignItems:"center", display:"flex", flexDirection: "row", width: "100%"}}>
            
            <Button  sx={{background:"#703E97", borderRadius:"2px", textTransform:'capitalize', backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" }}} 
                    onClick={submit}>
                    
                    <img src={discoverIcon}/>
                    <Typography sx={{color: "#F3F3F3", padding:'5px', fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                    {uiLabel["GenerateResults"]}
                    </Typography>
                </Button>
        </Box>
        </Box>
    )
}

const getResultsView = () => {
    return (

        <Box sx={{ ml: "60px", mr:'60px', mt:'30px', height: '95%', overflowY:'auto', display:"flex", flexDirection: 'column', gap: "15px" }}>
            
            <Box sx={{display:"flex", height: "90%", flexDirection: "row", gap: "15px"}}>
                <Box sx={{border:'1px solid #9982AB', borderRadius: '10px', padding:'15px', background:'#9982ab1a', display:"flex", flexDirection: "column", gap: "10px", width: "40%", overflowY:"scroll"}}>
                    <Typography sx={{color: "#703E97", fontWeight:"700", fontSize:"16px", fontFamily: "Open Sans", mb: "10"}}>
                    {uiLabel["InsightsResults"]}                  
                    </Typography>
                    <Typography sx={{color: "#474747", display:"flex", overflowY: "scroll", whiteSpace:'pre-line', fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                        {response.text_response}
                    </Typography>
                </Box>

                <Box sx={{border:'1px solid #9982AB', borderRadius: '10px', display:"flex", flexDirection: "row", width: "60%", padding:'15px', background:'#9982ab1a', overflowY:"scroll"}}>
                    <Grid container spacing={2} rowSpacing={5}>
                        {Object.entries(response.charts).map(([key, value]) => (
                            <Grid item md={12} lg={6} className={classes.gridItem}>
                                    
                            <Typography sx={{color: "#703E97", fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                                 {key}
                            </Typography>
                            <img src={`${value}?${sasToken}`} className={classes.image}></img>
                            <Button variant= 'text' sx={{ width: "200px", justifyContent: 'left', alignItems: 'center'}} onClick={() => handleDownload(`${value}?${sasToken}`)}>  
                                <img src={downloadIcon} style={{width:"12px", height:"12px"}}/>
                                <Typography sx={{color: "#474747", padding:'10px', fontWeight:"400", fontSize:"12px", fontFamily: "Open Sans", mb: "10"}}>
                                {uiLabel["Download"]}                 
                                </Typography>    
                            </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>

            <Box sx={{display: "flex", justifyContent: 'end'}}>
            <Button  sx={{background:"#703E97", borderRadius:"2px", backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" },}} 
                    onClick={e => setResults(false)}>
                    
                    <img src={goBackIcon} height='16px' />
                    <Typography sx={{color: "#F3F3F3", padding:'5px', fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                    {uiLabel["GoBackToInputScreen"]}  
                    </Typography>
                </Button>
            </Box>
        </Box>
    )
}

const header = `Dashboard > Chat Data Insights >`

    return (
        <div className={classes.insightsBox}>

        { !results && getInputView()}

        { results && getResultsView()}  

        {showExample && getPopOverView()}  

        <div className='divider'></div>
        <div className='footer'>{props.globalUiText.DASHBOARD_FOOTER}</div>
        </div>

    )
}

export default Insights