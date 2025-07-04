import './loader.css';
import { Box, CircularProgress, Typography } from '@mui/material'

function Loader(props) {

    return (
        <>
            {
                !props.isLoaded ?
                    <div className='loader-overlay'>
                        <Box sx={{ width: "300px", backgroundColor: "white", height: "fit-content", minHeight: "150px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10px", borderRadius: "10px", boxShadow: "2px 2px 12px 0px rgba(0, 0, 0, 0.25)" }}>
                            <CircularProgress />
                            <Typography sx={{ color: "#000", whiteSpace: 'pre-line', fontWeight: "600", fontSize: "20px", fontFamily: "Open Sans", margin: "20px 0 0" }}>
                                {typeof props.uiText.LOADER_TEXT != "undefined" ? props.uiText.LOADER_TEXT : "Please wait..."}
                            </Typography>
                        </Box>
                    </div> : <></>
            }
        </>
    )
}

export default Loader;