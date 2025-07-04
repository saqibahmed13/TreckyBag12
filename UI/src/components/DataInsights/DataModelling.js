import { Box, FormControl, MenuItem, Select, Typography, Button, Tab, Tabs, Divider, FormControlLabel, Checkbox, DialogTitle, Dialog, DialogContent, Alert, AlertTitle } from "@mui/material"

import classes from './InsightsContainer.module.css'
import insightsBlueIcon from './assets/insightsBlue.svg'
import questionIcon from './assets/questionIcon.svg'
import folderIcon from './assets/folderIcon.png'
import validatedIcon from './assets/validated.png'
import failedIcon from './assets/failed.png'
import deleteIcon from './assets/delete.png'
import dataUploadIcon from './assets/validateIcon.png'
import dataModellingIcon from './assets/dataModellingIcon.png'
import { useContext, useRef, useState } from "react"
import { BlobServiceClient } from '@azure/storage-blob';  
import { DataInsightsContext } from "./DataInsightsContext"
import API from "../../utils/api.service"
import DataModellingEditRelation from "./DataModellingEditRelation"
import { getSasToken } from "./Utility/Util"

const DataModelling = (props) => {

 const dataInfo = useContext(DataInsightsContext)
 const uiLabel = dataInfo.configLabels["Modelling"];
 const maxFiles = uiLabel["MaximumFiles"];

 const fileInputRef = useRef(null);  
 const [fileStatus, setFileStatus] = useState([])
 const [validated, setValidated] = useState(false)

 const [results, setResults] = useState(false)
 const [errorMsg, setErrorMsg] = useState(null)

  
 const handleUpload = () => {
    setErrorMsg(null)
    const submitPath =  "/dataupload/" + props.sessionID +'?user_email=' + `${props.userEmail}`
        const data = {
            "file_names": fileStatus.map((item) => item.fileName),
            "domain": props.domain
        }

        dataInfo.setLoading(true)

        API.POST(props.baseUrl, 
            submitPath,
            data,
            (response) => {
                dataInfo.setLoading(false)
                setValidated(true)
                updateValidation(response.data.AI.individuals_status)
            },
            (error) => {
                dataInfo.setLoading(false)
                setErrorMsg(uiLabel["ServiceFailed"])
            }
        )
}

const updateValidation = (response) => {
  let newStatus = [];
  Object.entries(response).map(([validatedFileName, status]) => {
    if (status === "Success") {
      newStatus.push({fileName: validatedFileName, status: uiLabel["Validated"]})
    } else {
      newStatus.push({fileName: validatedFileName, status: "failed", errorMsg: `${uiLabel["ErrorValidation"]} (${status})`})
    }
  })

  setFileStatus(newStatus)
}

const handleReset = () => {
setFileStatus([])
setValidated(false)
setErrorMsg(null)
}

  const handleFileUpload = () => {  
    fileInputRef.current.click();  
  };  

  const handleDrop = (event) => {  
    event.preventDefault();  
    if (fileStatus.length >= maxFiles || validated) {
      return
    }

    const selectedFiles = event.dataTransfer.files;

    const files = Object.values(selectedFiles);  

    const filesAllowed = maxFiles-fileStatus.length
  
    files.slice(0, filesAllowed).forEach((selectedFile) => {  
      uploadToBlobStorage(selectedFile)
    });   

  };  
  
const uploadToBlobStorage = (selectedFile) => {
    const fileType = selectedFile.type;  
    if (selectedFile == null) {
        return
    }
    if (!(fileType === 'text/csv' || fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {  
        return
    }
    const blobName = selectedFile.name;  
    fileInputRef.current.value = null


    setFileStatus((previousData)=> {
      const existingItem = previousData.find(item => item.fileName === blobName);  

      if (existingItem) {  
        const updatedData = previousData.map(item => {  
          if (item.fileName === blobName) {  
            return { ...item, status: uiLabel["Uploading"] };  
          }  
          return item;  
        });  
        return updatedData
      } else {  
        const newItem = {fileName: blobName, status: uiLabel["Uploading"]};  
        const updatedData = [...previousData, newItem]
        return updatedData
      } 
    })

    let userEmail = props.userEmail.split('@')[0].replace(/\./g, "_")


    const containerName = `chatdatainsight/${props.domain.toUpperCase()}/useruploaddata/${userEmail.toLowerCase()}`;  
    const sasToken = getSasToken()

    const blobServiceClient = new BlobServiceClient(  
        `https://saemtechpoc.blob.core.windows.net/?${sasToken}`  
      );  

    const containerClient = blobServiceClient.getContainerClient(containerName);  
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);  
    blockBlobClient.uploadData(selectedFile).then((response) => {

      setFileStatus((previousData)=> {
        const existingItem = previousData.find(item => item.fileName === blobName);  
  
        if (existingItem) {  
          const updatedData = previousData.map(item => {  
            if (item.fileName === blobName) {  
              return { ...item, status: uiLabel["Ready"] };  
            }  
            return item;  
          });  
          return updatedData
        } else {  
          const newItem = {fileName: blobName, status: uiLabel["Ready"]}; 
          const updatedData = [...previousData, newItem]
          return updatedData
        } 
      })

      })
    .catch((error) => {
          console.log(error.response.data); // => the response payload
    });

}

  const handleDragOver = (event) => {  
    event.preventDefault();  
  };  
  
  const handleFileChange = async (event) => {  
    const selectedFiles = event.target.files;

    const files = Object.values(selectedFiles);  

    const filesAllowed = maxFiles-fileStatus.length
  
    files.slice(0, filesAllowed).forEach((selectedFile) => {  
      uploadToBlobStorage(selectedFile)
    });    
};  

const deleteFile = (item) => {  
  const selectedFile = item.fileName;
  const updatedData = fileStatus.filter(item => item.fileName != selectedFile)
  setFileStatus(updatedData);
};  

    const [showExample, setShowExample] = useState(false)

    const getUploadedItem = (item) => {
        let borderColor = '1px solid #9982AB'
        let icon = null
        let statusColor = "#474747"
        let displayDeleteIcon = true
        if (item.status === uiLabel["Validated"]) {
            borderColor = '1px solid #21812D' 
            icon = validatedIcon
            statusColor = "#21812D"
            displayDeleteIcon = false
        } else if (item.status === "failed") {
            borderColor = '1px solid #D93954'
            icon = failedIcon
            statusColor = "#D93954"
            displayDeleteIcon = false
        }
       
        return(
        <Box sx={{display: 'flex', border: borderColor, borderRadius:'5px', alignItems:'top', background:'#9982ab1a', padding:'15px', gap:'20px'}}>
                    
            <img src={folderIcon} style={{width:"16px", height:"16px"}}/>
            <Box sx={{display: 'flex', flexDirection:'column', flexGrow: '1', mt:'-5px'}}>
                <Typography sx={{color: "#474747", fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                    {item.fileName}
               </Typography>
                <Typography sx={{color: statusColor, fontWeight:"700", fontSize:"14px", fontFamily: "Open Sans", textTransform: 'uppercase'}}>
                    {(item.status === "failed") ? item.errorMsg : item.status }
                </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            {icon && <img src={icon} style={{width:"16px", height:"16px"}}/>}
            {displayDeleteIcon && <img src={deleteIcon} style={{width:"16px", height:"16px"}} onClick={()=> deleteFile(item)}/>}

            </Box>
        </Box>
        )
    }

    const getInputView = () => {
        return(
            <Box sx={{ m: "32px", ml: "200px", mr:"200px", display:"flex", gap: "15px", flexDirection: "column", flexGrow: "1", overflowY:'auto'}}>
                <Box sx={{display:"flex", gap:'5px', padding:'30px', background:'#F0E9F4', alignItems:'start', flexDirection: "column", height: '240px'}}>
                    <Box sx={{display:"flex", color:'#F0E9F4', flexDirection: "row", alignItems:'center'}}>
                        <img src={insightsBlueIcon} height={'25px'} color='#703E97'/>
                        <Typography sx={{color: "#703E97", padding:'5px', fontWeight:"700", fontSize:"20px", fontFamily: "Open Sans"}}>
                            {uiLabel["DataUpload_Label"]}
                        </Typography>
                    </Box>

                    <Box sx={{justifyContent:"space-between", display:"flex", flexDirection: "row", width: "100%"}}>
                        <Typography sx={{color: "#474747", fontWeight:"400", fontSize:"15px", fontFamily: "Open Sans"}}>
                          {uiLabel["DataUpload_Description"]}
                        </Typography>
                        <Button variant= 'text' onClick={(e) => { setShowExample(true) }} sx={{textTransform:'capitalize', mt: '-15px'}}>
                            <img src={questionIcon}/>
                            <Typography paddingLeft={'5px'} sx={{color: "#8F00FF"}} onClick = {(e) => { setShowExample(true) }} >
                            {uiLabel["UploadGuidelines"]}
                            </Typography>
                        </Button>
                    </Box>
                    <Box onDrop={handleDrop} onDragOver={handleDragOver} 
                    sx={{background:'#ffffff', display:"flex", flexDirection:'column', alignItems: 'center', justifyContent:'center', width: "100%", height:'196px', border:"1px dashed #474747", overflowY:'auto'}}>
                        {uiLabel["DropFiles"].map((instructions) => (
                          <Typography sx={{color: "#474747", fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans", whiteSpace:'pre-line'}}>
                          {instructions}
                          </Typography>
                        ))}
                        <Button variant= 'contained' onClick={handleFileUpload} sx={{textTransform:'capitalize', backgroundColor:'#F1CB14', color: "#2A276E", "&:hover": { backgroundColor: "#F1CB14" },"&.Mui-disabled": { backgroundColor: "#F1CB14" }}} disabled = {fileStatus.length >= maxFiles || validated}>
                            <Typography paddingLeft={'5px'}>
                            {uiLabel["BrowseFiles"]}
                            </Typography>
                        </Button>
                    </Box>


                </Box>
                <input type="file" accept=".csv, .xlsx" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange}/> 
                {errorMsg &&
                <Alert severity="warning">
                  <AlertTitle>Error</AlertTitle>
                  {errorMsg}
                  </Alert>
              }
                <Typography sx={{color: "#703E97", padding:'5px', fontWeight:"700", fontSize:"13px", fontFamily: "Open Sans"}}>
                {uiLabel["Uploads"]}
                </Typography>

                {fileStatus.length < 1 &&
                <Typography sx={{color: "#474747", padding:'5px', fontWeight:"400", fontSize:"15px", fontFamily: "Open Sans"}}>
                  {uiLabel["NoFiles"]}
                </Typography>
                }

                { fileStatus.length > 0 &&
                fileStatus.map((item) => 
                 getUploadedItem(item)
                )}

                { fileStatus.length > 0 &&
                <Box sx={{display: "flex", justifyContent: 'end', gap: "15px"}}>

                {!validated && <Button  sx={{background:"#703E97", borderRadius:"2px", backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" }}}
                        onClick={handleUpload}>
                         <img src={dataUploadIcon} style={{width:"16px", height:"16px", paddingRight: '5px'}}/>
                        <Typography sx={{color: "#F3F3F3", fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                          {uiLabel["UploadDataSet"]}
                        </Typography>
                    </Button>
                  }

                  {validated && <Button  sx={{background:"#703E97", borderRadius:"2px", backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" }}}
                        onClick={handleReset}>
                        <Typography sx={{color: "#F3F3F3", paddingX: "5px",fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                          {uiLabel["Reset"]}
                        </Typography>
                    </Button>
                  }

                    {validated && getValidatedItems() &&
                      <Button  sx={{background:"#703E97", borderRadius:"2px", backgroundColor: "#703E97", "&:hover": { backgroundColor: "#8C5BAC" }}}
                        onClick={() => setResults(true)}>
                        <img src={dataModellingIcon} style={{width:"16px", height:"16px", paddingRight: '5px'}}/>
                        <Typography sx={{color: "#F3F3F3", fontWeight:"400", fontSize:"16px", fontFamily: "Open Sans"}}>
                        {uiLabel["GoToDataModelling"]}
                        </Typography>
                    </Button>
                    }
                </Box>
                }

            </Box>
        )
    }


 
  const getValidatedItems = () => {
    const validatedData = fileStatus.filter(item => item.status === uiLabel["Validated"])
    return validatedData.length > 0
  }

  const getNonValidatedItems = () => {
    const nonValidatedData = fileStatus.filter(item => item.status != uiLabel["Validated"])
    return nonValidatedData.length > 0
  }

  const getPopOverView = () => {
    return (
      <Dialog sx={{
          "& .MuiDialog-paper": {
            display: "flex",
            flexDirection: "column",
            background: "#E8E8E8",
            width: "720px",
            minHeight: "300px",
            padding: "20px",
            height: "fit-content",
          },
        }}
        onClose={(e) => setShowExample(false)}
        open={showExample}
      >
        <DialogTitle
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            display: "flex",
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            {uiLabel["UPLOAD_GUIDELINE_TITLE"]}
          </Typography>
          <Button variant="text" onClick={(e) => setShowExample(false)}>
            close
          </Button>
        </DialogTitle>
        <DialogContent sx={{ background: "#E8E8E8" }}>
          {Object.keys(uiLabel["FILE_TYPE"]).map((item) => (
            <Typography
              sx={{
                color: "#474747",
                display: "flex",
                flexDirection: "column",
                whiteSpace: "pre-line",
                fontWeight: "700",
                fontSize: "16px",
                fontFamily: "Open Sans",
                mb: 2,
                letterSpacing: "-0.4px",
              }}
              component="ol"
            >
              {item}
              {uiLabel["FILE_TYPE"][item].map((guideline) => (
                <Typography
                  sx={{
                    color: "#474747",
                    fontWeight: "400",
                    fontSize: "16px",
                    fontFamily: "Open Sans",
                    letterSpacing: "-0.4px",
                  }}
                  component="li"
                >
                  {guideline}
                </Typography>
              ))}
            </Typography>
          ))}
        </DialogContent>
      </Dialog>
    );
  };

    return (
        <div className={classes.insightsBox}>
            { !results && getInputView()}
            {results && <DataModellingEditRelation baseUrl= {props.baseUrl} selectedFiles={fileStatus} sessionID={props.sessionID} userEmail={props.userEmail} domain={props.domain} setSubFeature={props.setSubFeature}/>}
            {showExample && getPopOverView()}
            <div className='divider'></div>
            <div className='footer'>{props.globalUiText.DASHBOARD_FOOTER}</div>
    </div>

    )
}


export default DataModelling