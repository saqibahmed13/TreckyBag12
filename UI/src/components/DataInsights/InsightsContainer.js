import { AppBar, Drawer, MenuItem, Switch, Typography } from "@mui/material"
import classes from './InsightsContainer.module.css'
import logo from '../../assets/logo.png';
import Chat from "../chat/chat"
import Insights from "./Insights";
import { useContext, useState } from "react";
import { kChart, kInsights, kDiscover, kModelling, kTranaslationHub } from "./Utility/Constants";
import Discover from "./Discover";
import DataModelling from "./DataModelling";
import { SideBar } from './SideBar';
import { DataInsightsContext } from "./DataInsightsContext";
// import TranaslationHub from "../tranaslationHub/tranaslationHub";

const InsightsContainer = (props) => {

    const contextData = useContext(DataInsightsContext)


    return (
        <div className="chat-container">
            <nav className="navbar">
                <img src={logo} alt="CV" />
                <h2>ChatViatris</h2>
            </nav>

            <main className="main">
                <SideBar />
                {
                    contextData.selectedSubFeature === kChart &&
                    <Chat sessionChatPath={props.sessionChatPath} showHistory={props.showHistory} onRate={props.onRate}></Chat>
                }
                {
                    contextData.selectedSubFeature === kInsights &&
                    <Insights sessionChatPath={props.sessionId} />
                }
                {
                    contextData.selectedSubFeature === kDiscover &&
                    <Discover sessionChatPath={props.sessionId} />
                }
                {
                    contextData.selectedSubFeature === kModelling &&
                    <DataModelling sessionChatPath={props.sessionId} />
                }
                {/* {
                    contextData.selectedSubFeature === kTranaslationHub &&
                    <TranaslationHub sessionChatPath={props.sessionChatPath} showTranasltionHistory={props.showTranasltionHistory} onRate={props.onRate} />
                } */}
            </main>
        </div>
    )
}

export default InsightsContainer