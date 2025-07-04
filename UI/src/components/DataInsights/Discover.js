import { Box, Button, Checkbox, FormControl, FormControlLabel, Grid, Dialog, DialogContent, DialogTitle, MenuItem, Select, Slider, TextField, Typography, Alert, AlertTitle } from '@mui/material'
import classes from './InsightsContainer.module.css'
import { useContext, useEffect, useState } from 'react'
import goBackIcon from './assets/goBack.png'
import downloadIcon from './assets/downloadIcon.png'
import collapseIcon from './assets/collapse.png'
import expandIcon from './assets/expand.png'
import copyIcon from './assets/copyIcon.png'
import checkBoxIcon from './assets/checkBoxIcon.png'
import discoverIcon from './assets/discoverWhite.svg'
import discoverBlueIcon from './assets/Discover_blue.svg'
import questionIcon from './assets/questionIcon.svg'
import { CopyToClipboard, getSasToken, handleDownload } from './Utility/Util';
import { DataInsightsContext } from './DataInsightsContext';
import API from '../../utils/api.service';
import { toast } from 'react-toastify'

const Discover = (props) => {
    const dataInfo = useContext(DataInsightsContext)

    const uiLabel = dataInfo.configLabels["Discover"]
    const configLabels = dataInfo.appConfigLabels
    const [question, setQuestion] = useState("")
    const [rules, setRules] = useState("")

    const [visuals, setVisuals] = useState(4)
    const [selectedChart, setSelectedChart] = useState(uiLabel["DiscoverCharts"])

    const [showExample, setShowExample] = useState(false)
    const [showError, setShowError] = useState(false)


    const [results, setResults] = useState(false)
    const [quesResults, setQuesResults] = useState(null)


    const [response, setResponse] = useState([])
    const [errorMsg, setErrorMsg] = useState("")


    useEffect(() => {
        if (quesResults === null) {  
            return;
        } 
       getCharts(0)
       toast.info(uiLabel["GeneratingChart"], {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        autoClose: false,
        closeButton: false
      });

    }, [quesResults]);

const sasToken = getSasToken()

const submit = () => {
    setShowError(false);
    setResponse([])
    const submitPath =  "/discover/" + props.sessionID +'?user_email=' + `${props.userEmail}`+'&domain=' + `${props.domain}`+ '&Human=' + `${question}`+'&rules=' + `${rules}`+'&chart_type=' + `${selectedChart.join(',')}`+'&number_of_visualizations=' + `${visuals}`

        const data = {
            'user_email' : props.userEmail,
            'domain': props.domain,
            "Human": question,
            'rules': rules,
            'chart_type': selectedChart.join(','),
            'number_of_visualizations': visuals
        }

        dataInfo.setLoading(true)

        API.GET(props.baseUrl, 
            submitPath,
            (response) => {
                if(response.data.AI.is_relevant) {
                    setResults(true)
                    setQuesResults(response.data.AI.questions)
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
            
            })

}

const getCharts = (index) => {
    if (!results) { return }
    const submitPath =  "/discover/" + props.sessionID +'?user_email=' + `${props.userEmail}`+'&domain=' + `${props.domain}`+ '&Human=' + `${quesResults[index]}`+'&rules=' + `${rules}`+'&chart_type=' + `${selectedChart.join(',')}`+'&number_of_visualizations=' + `${visuals}`

        const data = {
            'user_email' : props.userEmail,
            'domain': props.domain,
            "Human": quesResults[index],
            'rules': rules,
            'chart_type': selectedChart.join(','),
            'number_of_visualizations': visuals,

        }

        API.POST(props.baseUrl, 
                submitPath,
                data,
                (response) => {
                    dataInfo.setLoading(false)
                    const result = {...response.data.AI, expanded: true}
                    if (response.data.AI.success) {
                        setResponse((prevResp) => [...prevResp, result])
                    }
                    if (index+1 < quesResults.length ) {
                        getCharts(index+1)
                    } else {
                        toast.dismiss()
                    }
                },
                (error) => {
                    dataInfo.setLoading(false)
                    setErrorMsg(uiLabel["ServiceFailed"])
                    setShowError(true)
                    toast.dismiss()
                }
            )
}

const getPopOverView = () => {
    const discoverQues = JSON.parse(configLabels["ExampleQuestionDiscover"])
    const questions = discoverQues?.QUESTIONS ?? [];
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
                        <Typography sx={{color: "#474747", display:"flex", whiteSpace:'pre-line', fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
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
        <div className={classes.insightsInputBox}>
            
        <Box sx={{mt:'40px', ml: "200px", mr:"200px", display:"flex", gap: "15px", flexDirection: "column"}}>

            <Box sx={{display:"flex", gap:'5px', background:'#F0E9F4', flexDirection: "column", width: "100%", height: '100px', paddingLeft:'10px', overflowY:'auto'}}>
                <Box sx={{display:"flex", m:'5px', color:'#F0E9F4', flexDirection: "row", alignItems:'center'}}>
                    <img src={discoverBlueIcon} height={'25px'} color='#703E97'/>
                    <Typography sx={{color: "#703E97", padding:'5px', fontWeight:"700", fontSize:"20px", fontFamily:"Open Sans"}}>
                    {uiLabel["Discover_Label"]}
                    </Typography>
                </Box>
                <Typography sx={{color: "#474747", padding:'5px', fontWeight:"400", fontSize:"15px", fontFamily:"Open Sans"}}>
                    {uiLabel["Discover_Description"]}
                </Typography>
            </Box>

            {showError &&
             <Alert severity="warning">
                 <AlertTitle>Error</AlertTitle>
                 {errorMsg}
                </Alert>
            }

            <Box sx={{justifyContent:"space-between", display:"flex", alignItems:'center', mt:'10px', mb: '-10px', flexDirection: "row"}}>
                <Typography sx={{color: "#703E97", fontWeight:"700", fontSize:"13px", fontFamily:"Open Sans", textTransform: 'uppercase'}}>
                {uiLabel["QuestionTitle"]}
                <span style={{color: "#703E97", fontWeight:"700", fontSize:"12px", fontFamily:"Open Sans", textTransform: 'uppercase'}}>    (Optional)</span>
                </Typography>
                <Button variant= 'text' onClick={(e) => { setShowExample(true) }} sx={{textTransform:'capitalize'}}>
                    <img src={questionIcon}/>
                    <Typography paddingLeft={'5px'} sx={{color: "#703E97"}} onClick = {(e) => { setShowExample(true) }} >
                        {uiLabel["ExampleQuestion"]}
                    </Typography>
                </Button>
            </Box>

            <TextField placeholder='Enter' sx={{width: "100%", background:"#9982ab1a"}} 
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                } 
            />

            <Box sx={{justifyContent:"space-evenly", display:"flex", mt:'15px', flexDirection: "row", width: "100%", gap: "50px"}}>
             <Box sx={{width: "100%"}}>
                <Box sx={{justifyContent:"space-between",display:"flex", flexDirection: "row", width: "100%"}}>
                    <Typography sx={{color: "#703E97", textTransform: 'uppercase'}}>
                        {uiLabel["ChartTitle"]}
                    </Typography>
                    <Button onClick={handleSelectAll}>
                    <img src={checkBoxIcon} height={'16px'} color='#703E97'/>

                    <Typography  sx={{borderRadius:"2px", color:'#474747', ml:"5px", fontWeight:"400", fontSize:"14px", fontFamily:"Open Sans", textTransform:'capitalize'}}>
                        {selectedChart.length === uiLabel["DiscoverCharts"].length ? "Deselect All" : "Select All"}
                    </Typography>
                    </Button>
                </Box>
                <Grid container spacing={1}>
                { uiLabel["DiscoverCharts"].map((item) => (
                     <Grid item xs={12} md={4} sm={6}>
                        <FormControlLabel 
                        control={ <Checkbox checked = {selectedChart.includes(item)} 
                        onChange={(event)=> {handleChartSelection(event, item)}}
                        style ={{color: "#8F00FF"}}/>
                    }
                    label={item} sx={{padding: "0px"}}/>
                   </Grid>
                    ))}
                </Grid>
             </Box>

             <Box sx={{width: "100%"}}>
                <Box sx={{justifyContent:"space-between", display:"flex", height: "70px", flexDirection: "row", width: "100%"}}>
                    <Typography sx={{color: "#703E97", textTransform: 'uppercase'}}>
                        {uiLabel["VisualizationsTitle"]}
                    </Typography>
                    <TextField placeholder='Enter*' variant='outlined' sx={{width: "75px", height: "50px", background:"#9982ab1a"}} 
                        value={visuals} inputMode='numeric' inputProps={{ max: uiLabel["MaxVisualisation"] }}  
                        onChange={(e) => setVisuals(e.target.value)}
                    />
                </Box>
                <Box>
                <Slider  value={visuals} onChange={handleProgressChange} max={uiLabel["MaxVisualisation"]} min={1}/> 
                <Box sx={{justifyContent:"space-between", display:"flex", flexDirection: "row", width: "100%"}}>
                    <Typography sx={{color: "#703E97", textTransform: "capitalize"}}>
                        1
                    </Typography>
                    <Typography sx={{color: "#703E97", textTransform: "capitalize"}}>
                    {uiLabel["MaxVisualisation"]}
                    </Typography>
                </Box>
                </Box>
             </Box>  
            </Box>

            <Box sx={{width: "100%", display:"flex", gap: "5px", flexDirection: "column"}}>
            <Typography sx={{color: "#703E97", textTransform: 'uppercase'}}>
            {uiLabel["RulesTitle"]}
                <span style={{color: "#703E97", fontWeight:"700", fontSize:"12px", fontFamily:"Open Sans", textTransform: 'uppercase'}}>    (Optional)</span>
            </Typography>

            <TextField placeholder={uiLabel["RulesPlaceHolder"]} sx={{width: "100%", background:"#9982ab1a"}} 
                value={rules}
                onChange={(e) =>
                  setRules(e.target.value)
                }
                maxRows={3} minRows={3}
                
            />
            <Box sx={{justifyContent: 'end', alignItems:'end', display:"flex", flexDirection: "row", mt:"10px", width: "100%"}}>
                
                <Button  sx={{background:"#703E97", borderRadius:"2px", textTransform:'capitalize', backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" },}} 
                    onClick={submit} >
                    
                    <img src={discoverIcon}/>
                    <Typography sx={{color: "#F3F3F3", padding:'5px', fontWeight:"400", fontSize:"16px", fontFamily:"Open Sans"}}>
                    {uiLabel["GenerateResults"]}
                    </Typography>
                </Button>
            </Box>
            </Box>
        </Box>
        
        </div>  
    )
}

const handleCollapse = (e, collapsedItem) => { 
   const updatedResponse = response.map((item) => {
        if (item.chart_title === collapsedItem.chart_title) {
            item.expanded =!item.expanded
        }
        return item
    })
    setResponse(updatedResponse)
  };

const getResultsView = () => {
    return (
        <div className={classes.insightsInputBox}>

        <Box sx={{ ml: "60px", mr:'60px', mt:'30px', overflowX:'hidden', display:"flex", flexDirection: 'column', gap: "15px", overflowY:"scroll" }}>
            {showError &&
             <Alert severity="warning">
                 <AlertTitle>Error</AlertTitle>
                 {errorMsg}
            </Alert>}
            {response.map((item) => (  

                <Box sx={{border:'1px solid #9982AB', padding:'15px', borderRadius: '10px', background:'#9982ab1a', display:"flex", flexDirection: 'column', justifyContent:'space-evenly', gap: "10px", height: 'auto'}}>
                
                <Box sx={{display: "flex", justifyContent: 'space-between'}}>
                    <Typography sx={{color: "#474747", fontWeight:"400", fontSize:"20px", fontFamily:"Open Sans"}}>
                        {item.chart_title} 
                    </Typography>
                    <img src={item.expanded ? collapseIcon : expandIcon} onClick={e => handleCollapse(e, item)} width={"25px"} height={"25px"}></img>
                </Box>

               { item.expanded &&
               
               <Box sx={{ display:"flex", flexDirection: 'row', justifyContent:'space-evenly', gap: "10px"}}>

                { item.chart_url && <Box sx={{display:"flex", flexDirection: "column", gap: "10px", width: "50%"}}>

                 <img src={`${item.chart_url}?${sasToken}`} className={classes.image}></img>
                 </Box>
                }

                 <Box sx={{display:"flex", flexDirection: "column", gap: "10px", width: "50%"}}>
                    <Typography sx={{color: "#703E97", fontWeight:"700", fontSize:"16px", fontFamily:"Open Sans", mb: "10"}}>
                    {uiLabel["InsightsResults"]}                  
                    </Typography>
                    <Typography sx={{color: "#474747", display:"flex", whiteSpace:'pre-line', fontWeight:"400", fontSize:"16px", fontFamily:"Open Sans"}}>
                        {item.text_response}
                    </Typography>

                    <Typography sx={{color: "#474747", fontWeight:"700", fontSize:"16px", fontFamily:"Open Sans", mb: "10"}}>
                    {uiLabel["Reasoning"]}
                    </Typography>
                    <Typography sx={{color: "#474747", display:"flex", whiteSpace:'pre-line', fontWeight:"400", fontSize:"16px", fontFamily:"Open Sans"}}>
                        {item.reason}
                    </Typography>

                    <Typography sx={{color: "#474747", fontWeight:"700", fontSize:"16px", fontFamily:"Open Sans", mb: "10"}}>
                    {uiLabel["CodeQuery "]}                 
                    </Typography>

                    <Box sx={{display:"flex", border:'1px solid #9982AB',  paddingRight:'10px', paddingLeft: '5px', paddingTop: '5px', backgroundColor:'#ffffff', flexDirection: "row", gap: "10px", justifyContent: 'space-between', alignItems: 'center'}}>

                    <Typography sx={{color: "#474747", fontWeight:"400", height:'50px', fontSize:"15px", fontFamily:"Open Sans", overflowX:'clip', overflowY:'auto', wordBreak:'break-word'}} >
                        {item.sql_query}                 
                    </Typography> 

                    <Button variant= 'text' sx={{color: "#2A276E", paddingRight:'5px', fontWeight:"700", alignItems: 'center',fontSize:"16px", fontFamily:"Open Sans", mb: "10"}} onClick= {(event) => CopyToClipboard(event, item.sql_query)}>
                        <img src={copyIcon} style={{width:"16px", height:"16px", paddingRight: '5px'}}/>
                        {uiLabel["Copy"]} 
                    </Button>
                    </Box>

                    <Button variant= 'text' sx={{ width: "200px", justifyContent: 'left', alignItems: 'center'}} onClick={() => handleDownload(`${item.chart_url}?${sasToken}`)}>  
                        <img src={downloadIcon} style={{width:"12px", height:"12px"}}/>
                        <Typography sx={{color: "#474747", padding:'10px', fontWeight:"400", fontSize:"12px", fontFamily:"Open Sans", mb: "10"}}>
                        {uiLabel["Download"]}                 
                        </Typography>    
                    </Button>
                </Box>   
                </Box> 
               }          
                </Box>
            ))} 

            <Box sx={{display: "flex", justifyContent: 'end'}}>
                    <Button  sx={{background:"#703E97", borderRadius:"2px", backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" }}} 
                    onClick={handleGenerateBackTap}>                    
                    <img src={goBackIcon} height='16px'/>
                    <Typography sx={{color: "#F3F3F3", paddingLeft:'5px', padding:'5px', fontWeight:"400", fontSize:"16px", fontFamily:"Open Sans"}}>
                    {uiLabel["GoBackToInputScreen"]}  
                    </Typography>
                </Button>
            </Box>
        </Box>
        </div>
    )
}

const handleGenerateBackTap = () => {
    setResults(false)
    toast.dismiss()
    setResponse([])
    setQuesResults(null)
    setShowError(false);
}

     const handleChartSelection = (event, item) => {
      if (event.target.checked) {
        setSelectedChart((prevSelectedItems) => [...prevSelectedItems, item]);
      } else {
        setSelectedChart((prevSelectedItems) =>
          prevSelectedItems.filter((selectedItem) => selectedItem !== item)
        );
      }
    };

    const handleProgressChange = (event, newValue) => {
      setVisuals(newValue);
    };

    const handleSelectAll = (event) => {
      /* All are selected. Deselect all*/
      if (selectedChart.length === uiLabel["DiscoverCharts"].length) {
        setSelectedChart([]);
      } else {
        setSelectedChart(uiLabel["DiscoverCharts"]);
      }
    }; 

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

export default Discover