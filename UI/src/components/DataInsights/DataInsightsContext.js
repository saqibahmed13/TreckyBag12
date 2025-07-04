import { useContext } from "react";
import React, { useState, useEffect } from "react";
import Loader from "./Utility/Loader";

export const DataInsightsContext = React.createContext({
    loading: false,
    setLoading: ()=> {},
});


export default function DataInsightsProvider(props) {
    const [info, setInfo] = useState({});

    useEffect(()=> {
      setInfo({
        ...info,
        configLabels: props.uiConfig,
        appConfigLabels: props.appConfig
    })
    }, [props])

    const setLoading = (loadingState) => {
      props.loaded(!loadingState)
    }
    
    const handleDomainSelection = (domainSelected) => {
      setInfo({
        ...info,
        selectedDomain: domainSelected
    })
    }


    const contextValue = {
        ...info,
        setLoading: setLoading,
        handleDomainSelection: handleDomainSelection,
      };
      return (
        <DataInsightsContext.Provider value={contextValue}>
          {props.children}
          {info.loading && <Loader/>}
        </DataInsightsContext.Provider>
      );
}