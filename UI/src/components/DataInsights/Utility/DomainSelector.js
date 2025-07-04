import { useContext } from "react"
import { DataInsightsContext } from "../DataInsightsContext"
import { FormControl, MenuItem, Select, Typography } from "@mui/material"

const DomainSelector = (props) => {

    const dataInfo = useContext(DataInsightsContext)
    return(
    <div style={{width: "100%", gap: "20px", alignItems: "center", display: "flex", flexDirection: "column"}}>
        <Typography>
            <span style={{ fontFamily: 'Open Sans', fontSize: '14px', fontWeight: '400', color:"#9982AB" }}> {props.header} </span>  
            <span style={{ fontFamily: 'Open Sans', fontSize: '14px', fontWeight: '700', color:"#2A276E"}}>{props.feature}</span>
        </Typography>
        <FormControl sx={{width: "230px", height: "56px"}}>
            <Select value={dataInfo.selectedDomain} sx={{justifyContent: "center"}} onChange={(event)=> dataInfo.handleDomainSelection(event.target.value)}>
                {
                    dataInfo.availableDomain.map((option) => (
                        <MenuItem value = {option.displayValue}>{option.displayValue}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
     </div>
    )
}

export default DomainSelector