import { Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import copy from '../../assets/Copy_1.png'
import { CopyToClipboard } from '../DataInsights/Utility/Util';
import copyIcon from '../DataInsights/assets/copyIcon.png'


const DisplayCode = (props) => {
    const [isExpanded, setIsExpanded] = React.useState(false)

    return(
        <>
        {props.code ? (
            <>
            <br />
              <Button onClick={() => {setIsExpanded((prev) => !prev)}} sx={{background:"#B292C6", color:"#F3F3F3"}}
              onMouseOver={(e) => e.target.style.backgroundColor = '#B292C6'}  
              onMouseOut={(e) => e.target.style.backgroundColor = '#B292C6'}
              >
                {isExpanded ? "Hide Code" : "Show Code"}
             </Button>
            </>
          ) : ( <></> )
        }

        {props.code ? (
            isExpanded && (
              <>

            <Box sx={{display:"flex", border:'1px solid #9982AB', paddingRight:'20px', paddingLeft: '5px', paddingTop: '5px', mt:'15px', backgroundColor:'#ffffff', flexDirection: "row", gap: "10px", justifyContent: 'space-between', alignItems: 'center'}}>

            <Typography sx={{color: "#474747", fontWeight:"400", height:'50px', fontSize:"15px", fontFamily: "Open Sans", overflowX:'clip', overflowY:'auto', wordBreak:'break-word'}} >
              {props.code}             
            </Typography> 

            <Button variant= 'text' sx={{color: "#2A276E", fontWeight:"700", alignItems: 'center',fontSize:"16px", fontFamily: "Open Sans", mb: "10"}} onClick= {(event) => CopyToClipboard(event, props.code)}>
                <img src={copyIcon} style={{width:"16px", height:"16px", paddingRight: '5px'}}/>
                Copy
            </Button>    
            </Box>
              
              </>
            )
          ) : ( <></> )
        }
        </>
    )

}

export default DisplayCode