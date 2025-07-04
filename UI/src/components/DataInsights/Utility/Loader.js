import React from 'react'
import { CircularProgress, Typography } from '@mui/material'

const Loader = () => {
  return (
    <div 
      style={{
        display: "flex",
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        zIndex: "1000",
        background: "#00000066",
        pointerEvents: 'unset',
      }}>
        <CircularProgress />
        <Typography sx={{color: "#474747", whiteSpace:'pre-line', fontWeight:"600", fontSize:"16px", fontFamily: "Open Sans"}}>
        Please wait...
        </Typography>
      </div>
  )
}

export default Loader