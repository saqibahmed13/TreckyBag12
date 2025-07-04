import askQuestion from './assets/askquestion.svg'
import insightsIcon from './assets/Insights.svg'
import modellingIcon from './assets/Modelling.svg'
import discoverIcon from './assets/Discover.svg'
import { kChart, kInsights, kDiscover, kModelling } from "./Utility/Constants";
import classes from './InsightsContainer.module.css'
import { useContext, useEffect, useState } from 'react';
import { Switch, Typography } from '@mui/material';
import { DataInsightsContext } from './DataInsightsContext';

export const SideBar = (props) => {
  const dataInfo = useContext(DataInsightsContext)
  const uiLabel = dataInfo.configLabels["Sidebar"] ?? {};
  const [availableSections, setAvailableSections] = useState([])

  const [advMode, setAdvMode] = useState(false)

  useEffect(() => {
    setAvailableSections(configBasicSections())
  }, []);

  const configBasicSections = () => {
    const givenBasicSections = props.config?.basicModeOptions ?? []
    return AdvSections.filter((section) => givenBasicSections.includes(section.title));
  }

  const configAdvSections = () => {
    const givenBasicSections = props.config?.advModeOptions ?? []
    return AdvSections.filter((section) => givenBasicSections.includes(section.title));
  }

  const handleChange = (event) => {
    setAdvMode(event.target.checked);
    if (event.target.checked) {
      setAvailableSections(configAdvSections())
    } else {
      setAvailableSections(configBasicSections())
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: "-95px", width: "80px", background: "#ffffff", borderRight: "0.5px solid #9982AB" }}>
        <div className={classes.sidebar}>
          <ul className={classes.menu}>
            {
              availableSections.map((section) => (
                <li onClick={(e) => props.handleSubFeatureSelection(section.title)} style={{ backgroundColor: props.selectedSubFeature === section.title ? '#F3F3F3' : 'transparent' }}>
                  <img src={section.imageUrl} />
                </li>
              ))
            }
          </ul>
        </div>


        {props.config?.showAdvMode &&
          <>
            <div className={classes.footer}>
              <div style={{ display: 'flex', padding: "5px", color: "#464646", fontWeight: "400", fontSize: "14px", fontFamily: "Open Sans" }}>
                {uiLabel["AdvMode"] ?? "Adv Mode"}
              </div>
              <Switch checked={advMode} onChange={handleChange} sx={{
                color: "#703E97", boxSizing: 'border-box',
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: "#703E97", color: "#703E97" },
                '& .MuiSwitch-switchBase.Mui-checked': { color: "#703E97" }
              }} />
            </div>
          </>
        }
      </div>
    </>
  )
}

const BasicSections = [
  { title: kChart, imageUrl: askQuestion },
  { title: kDiscover, imageUrl: discoverIcon },
  { title: kInsights, imageUrl: insightsIcon }
]

const AdvSections = [
  { title: kChart, imageUrl: askQuestion },
  { title: kDiscover, imageUrl: discoverIcon },
  { title: kInsights, imageUrl: insightsIcon },
  { title: kModelling, imageUrl: modellingIcon },
];