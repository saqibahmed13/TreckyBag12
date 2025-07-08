import React, { useEffect, useState } from "react";
import axios from "axios";
import './App.css';
import Header from "./components/header/header";
import Chat from './components/chat/chat';
import ChatHistory from "./components/chathistory/chathistory";
import Error from "./components/error/error";
import Dashboard from "./components/dashboard/dashboard";
import Loader from "./components/loader/loader";
import Acknowledge from "./components/acknowledge/acknowledge";
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { Box } from "@mui/material";
import { SideBar } from "./components/DataInsights/SideBar";
import { kChart, kDiscover, kInsights, kModelling, kTranaslationHub } from "./components/DataInsights/Utility/Constants";
import Discover from './components/DataInsights/Discover';
import Insights from './components/DataInsights/Insights';
import DataModelling from './components/DataInsights/DataModelling';
import DataInsightsProvider from "./components/DataInsights/DataInsightsContext";
import TranaslationHub from './components/tranaslationHub/tranaslationHub';
import TranaslationHubHistory from './components/tranaslationHub/tranaslationHubHistory';
// import SupportBotChat from './components/supportBots/supportBotChats';
// import SupportBotVoice from './components/supportBots/supportBotVoices';
import API from "./utils/api.service";
import { setSasToken } from "./components/DataInsights/Utility/Util";
import APPSERVICE from "./utils/appservice";
import SDLCChat from "./components/sdlcDocCreation/sdlcChat";
import SDLCChatHistory from "./components/sdlcDocCreation/sdlcChatHistory"


let sessionID = null;
let sessionIndex = 0;
let baseURL = '';
let authURL = '';
let config = '';
let loadDashboard = false;
let dashboardMap = {};
let dataPrivacyURL = ''
let prodMode = (window.location.hostname !== "localhost"); //PRODUCTION CHECK
let getGlobalConfigResponse = {};
let getHubSessionId = null;
let getFileUploadedData = [];
let getFileUploadedGlossaryData = '';
let formDataSet = {};
let getTranaslationUloadedFile = [];
let getMetaTagValue = [];

function App() {
  const getURIDetails = () => {
    const useCase = window.location.pathname.split('/')[1];
    const domain = new URLSearchParams(window.location.search).get('domain');

    if (!useCase.length && domain == null) {
      loadDashboard = true;
      return false;
    } else if (useCase.length && domain == null) {
      loadDashboard = false;
      return {
        'USECASE': useCase,
        'DOMAIN': ''
      }
    }
    else {
      loadDashboard = false;
      return {
        'USECASE': useCase,
        'DOMAIN': domain
      }
    }
  }

  //USECASE, DOMAIN will be passed through query string. Like, http://localhost:3000/cas?domain=hr
  const getURI = getURIDetails()
  const USECASE = getURI ? getURI.USECASE : '';
  const DOMAIN = getURI ? getURIDetails().DOMAIN : '';
  const [loaded, setLoaded] = React.useState(false);
  const [domainList, setDomainList] = React.useState([]);
  const [userEmail, setUserEmail] = React.useState('');
  const [promptQuest, setPromptQuest] = React.useState([]);
  const [uiText, setUIText] = React.useState({});
  const [staticText, setStaticText] = React.useState({});
  const [staticTranslationHubText, setStaticTranslationHubText] = React.useState({});
  const [globalUiText, setGlobalUiText] = React.useState({});
  const [error, setError] = React.useState(0);
  const [sessionList, setSessionList] = React.useState([]);
  const [sessionTranaslationList, setSessionTranaslationList] = React.useState([]);
  const [session, setSession] = React.useState();
  const [showHistoryclosed, setShowHistoryclosed] = React.useState(false);
  const [sessionChatURL, setSessionChatURL] = React.useState(null);
  const [sessionName, setSessionName] = React.useState(null);
  const [updateChatHistory, setUpdateChatHistory] = React.useState(0);
  const [domain, setDomain] = React.useState(DOMAIN);
  const [allowed, setAllowed] = React.useState(false);
  const [domainAllias, setDomainAllias] = React.useState(false);
  const [initLoad, setInitLoad] = React.useState(true);
  const [activeSessionID, setActiveSessionID] = React.useState(null);
  const [resetStates, setResetState] = React.useState(false);
  const [alliasName, setAlliasName] = React.useState('');
  const [showAck, setShowAck] = React.useState(false);
  const [showHistoryTranaslationclosed, setShowHistoryTranaslationclosed] = React.useState(false);
  const [updateTranaslationHistory, setUpdateTranaslationHistory] = React.useState(0);
  const [sessionTranaslationURL, setSessionTranaslationChatURL] = React.useState(null);
  const [getValidateActiveDirectory, setGetValidateActiveDirectory] = React.useState([]);
  const [isGlossary, setIsGlossary] = React.useState(false);
  const [hubTranaslationData, setHubTranaslationData] = React.useState({});
  const [getSessionID, setGetSessionID] = React.useState(null);
  const [isTranslationDone, setIsTranslationDone] = React.useState(false);
  const [sessionTimeOutMsg, setSessionTimeOutMsg] = React.useState(null);
  const [metaTagList, setMetaTagList] = React.useState([]);
  const [selectedTagName, setSelectedTagName] = React.useState('');
  const [selectedTagValues, setSelectedTagValues] = React.useState([]);
  const [resetMetaTags, setResetMetaTags] = React.useState(false);
  const [visibleSupportBot, setVisibleSupportBot] = React.useState(false);
  const [isFileUploaded, setIsFileUploaded] = React.useState(false);
  const [sessions, setSessions] = React.useState([]);
  const [thesessionID, setTheSessionID] = useState(null);


  let auth_response = null;

  let autoReplace = [];
  let tempGlobalText = [];
  let tempAlliasName = "";

  const updateConfigFiles = callback => {
    dashboardMap.USECASES.map((key, index) => {
      try {
        getDataFromAppService(key, data => {
          if (dashboardMap.USECASES.length - 1 === index) {
            if (callback) callback();
          }
        });
      } catch (exc) {
        console.log('CONFIG > DASHBOARD-MAP LOADING ERROR');
      }
    });
  }

  const getEnvironmentJSON = callback => {
    axios.get('./environment.json')
      .then((response) => {
        try {
          processAutoReplace(response.data, response.data.AUTO_REPLACE_REF, resdata => {
            resdata.AUTO_REPLACE_REF = updateReplaceVariables(response.data.AUTO_REPLACE_REF, response.data.AUTO_REPLACE_REF);
            getDataFromAppService(resdata, data => {
              let responseData = data;
              config = {
                "upload": typeof responseData.SHOW_UPLOAD != "undefined" ? JSON.parse(responseData.SHOW_UPLOAD) : false,
                "references": typeof responseData.SHOW_DOC_REFERENCE != "undefined" ? JSON.parse(responseData.SHOW_DOC_REFERENCE) : false,
                "groupBy": typeof responseData.GROUPBY != "undefined" ? JSON.parse(responseData.GROUPBY) : false,
                "auth": typeof responseData.AUTH != "undefined" ? JSON.parse(responseData.AUTH) : false,
                "delete": typeof responseData.DELETE != "undefined" ? JSON.parse(responseData.DELETE) : false,
                "download": typeof responseData.SHOW_DOWNLOAD != "undefined" ? JSON.parse(responseData.SHOW_DOWNLOAD) : false
              };

              try {
                config["sideBar"] = typeof responseData.SHOW_SIDEBAR != "undefined" ? JSON.parse(responseData.SHOW_SIDEBAR) : false;
                config["showCode"] = typeof responseData.SHOW_CODE != "undefined" ? JSON.parse(responseData.SHOW_CODE) : false;
                config["showImage"] = typeof responseData.SHOW_IMAGE != "undefined" ? JSON.parse(responseData.SHOW_IMAGE) : false;
                config["showAdvMode"] = responseData["SHOW_ADVMODE"] ?? true;
                config["basicModeOptions"] = responseData["BASICMODEOPTIONS"] ?? [];
                config["advModeOptions"] = responseData["ADVMODEOPTIONS"] ?? [];
              } catch (error) {

              }

              baseURL = responseData.BASE_URL;
              authURL = 'https://' + window.location.hostname + '/.auth/me';
              tempAlliasName = responseData.ALLIAS;
              setAlliasName(tempAlliasName);

              if (domain.length === 0) {
                dashboardMap.USECASES.map((value, index) => {
                  if (value.USECASE === USECASE) {
                    window.location.href = window.location.origin + `/${value.USECASE}?domain=${value.DEFAULT_DOMAIN}`;
                  }
                })
              }

              try {
                checkAndSetAutoReplace(responseData.AUTO_REPLACE_REF, () => {
                  if (callback) callback();
                });
              } catch (exc) {
                console.log('USECASE/ENVIRONMENT SET AUTO COMPLETE DATA ERROR');
              }

              //if (callback) callback();
            });
          }, true);
        } catch (exc) {
          console.log('AUTO REPLACE ERROR');
        }
      })
      .catch(error => {
        setError(1);
        console.log('ENVIROMENT FILE NOT FOUND!');

        try {
          processAutoReplace(tempGlobalText, autoReplace, data => {
            setGlobalUiText(data);
          });
        } catch (exc) {
          console.log('USECASE/ENVIRONMENT STATIC AUTO REPLACE ERROR')
        }
      });
  }

  const getDomainStaticText = () => {
    if (USECASE != "cdi") return;
    axios.get('./' + USECASE.toLowerCase() + '_label.json')
      .then((response) => {
        setStaticText(response.data)
      })
      .catch(error => {
        console.log('USE CASE SPECIFIC STATIC TEXT FILE NOT FOUND!');
      });
  }

  const getTranslationHubStaticText = () => {
    axios.get('./tranaslationHub.json')
      .then((response) => {
        setStaticTranslationHubText(response.data)
      })
      .catch(error => {
        console.log('USE CASE SPECIFIC STATIC TEXT FILE NOT FOUND!');
      });
  }

  const getAppConfigResponse = async (data) => {
    let responseData = data;
    let appConfigData = getGlobalConfigResponse;
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    const pathSegment = urlObj.pathname.split('/')[1].toUpperCase();
    const domainParam = urlObj.searchParams.get('domain').toUpperCase();
    let hyperLinknNamePriorityFirst = "UI_" + pathSegment + "_" + domainParam + "_CHAT_HYPERLINK";
    let getAppConfigKeyDataFirst = Object.keys(appConfigData).filter(item => item === hyperLinknNamePriorityFirst);
    let hyperLinknNamePrioritySecond = "UI_" + pathSegment + "_DEFAULT" + "_CHAT_HYPERLINK";
    let getAppConfigKeyDataSecond = Object.keys(appConfigData).filter(item => item === hyperLinknNamePrioritySecond);
    let hyperLinknNamePriorityThird = "UI_DEFAULT_DEFAULT_CHAT_HYPERLINK";
    let getAppConfigKeyDataThird = Object.keys(appConfigData).filter(item => item === hyperLinknNamePriorityThird);
    let hyperLinknTextPriorityFirst = "UI_" + pathSegment + "_" + domainParam + "_CHAT_HYPERLINK_TEXT";
    let getAppConfigKeyDataFourth = Object.keys(appConfigData).filter(item => item === hyperLinknTextPriorityFirst);
    let hyperLinknTextPrioritySecond = "UI_" + pathSegment + "_DEFAULT" + "_CHAT_HYPERLINK_TEXT";
    let getAppConfigKeyDataFifth = Object.keys(appConfigData).filter(item => item === hyperLinknTextPrioritySecond);
    let hyperLinknTextPriorityThird = "UI_DEFAULT_DEFAULT_CHAT_HYPERLINK_TEXT";
    let getAppConfigKeyDataSixth = Object.keys(appConfigData).filter(item => item === hyperLinknTextPriorityThird);
    let hyperChatMailIdPriorityFirst = "UI_" + pathSegment + "_" + domainParam + "_CHAT_MAIL_ID";
    let getAppConfigKeyDataSeventh = Object.keys(appConfigData).filter(item => item === hyperChatMailIdPriorityFirst);
    let hyperChatMailIdPrioritySecond = "UI_" + pathSegment + "_DEFAULT" + "_CHAT_MAIL_ID";
    let getAppConfigKeyDataEight = Object.keys(appConfigData).filter(item => item === hyperChatMailIdPrioritySecond);
    let hyperChatMailIdPriorityThird = "UI_DEFAULT_DEFAULT_CHAT_MAIL_ID";
    let getAppConfigKeyDataNine = Object.keys(appConfigData).filter(item => item === hyperChatMailIdPriorityThird);
    let hyperChatMailTextPriorityFirst = "UI_" + pathSegment + "_" + domainParam + "_CHAT_MAIL_TEXT";
    let getAppConfigKeyDataTen = Object.keys(appConfigData).filter(item => item === hyperChatMailTextPriorityFirst);
    let hyperChatMailTextPrioritySecond = "UI_" + pathSegment + "_DEFAULT" + "_CHAT_MAIL_TEXT";
    let getAppConfigKeyDataEleven = Object.keys(appConfigData).filter(item => item === hyperChatMailTextPrioritySecond);
    let hyperChatMailTextPriorityThird = "UI_DEFAULT_DEFAULT_CHAT_MAIL_TEXT";
    let getAppConfigKeyDataTwelth = Object.keys(appConfigData).filter(item => item === hyperChatMailTextPriorityThird);
    let get_new_HYPERLINK_Url = "NA";
    let get_new_HYPERLINK_Text = "NA";
    let get_new__CHAT_MAIL_ID = "NA";
    let get_new_CHAT_MAIL_TEXT = "NA";
    if (getAppConfigKeyDataFirst.length == 0 && getAppConfigKeyDataSecond.length > 0) {
      get_new_HYPERLINK_Url = appConfigData[getAppConfigKeyDataSecond[0]];
    }
    if (getAppConfigKeyDataFirst.length == 0 && getAppConfigKeyDataSecond.length == 0 && getAppConfigKeyDataThird.length > 0) {
      get_new_HYPERLINK_Url = appConfigData[getAppConfigKeyDataThird[0]];
    }
    if (getAppConfigKeyDataFourth.length == 0 && getAppConfigKeyDataFifth.length > 0) {
      get_new_HYPERLINK_Text = appConfigData[getAppConfigKeyDataFifth[0]];
    }
    if (getAppConfigKeyDataFourth.length == 0 && getAppConfigKeyDataFifth.length == 0 && getAppConfigKeyDataSixth.length > 0) {
      get_new_HYPERLINK_Text = appConfigData[getAppConfigKeyDataSixth[0]];
    }
    if (getAppConfigKeyDataSeventh.length == 0 && getAppConfigKeyDataEight.length > 0) {
      get_new__CHAT_MAIL_ID = appConfigData[getAppConfigKeyDataEight[0]];
    }
    if (getAppConfigKeyDataSeventh.length == 0 && getAppConfigKeyDataEight.length == 0 && getAppConfigKeyDataNine.length > 0) {
      get_new__CHAT_MAIL_ID = appConfigData[getAppConfigKeyDataNine[0]];
    }
    if (getAppConfigKeyDataTen.length == 0 && getAppConfigKeyDataEleven.length > 0) {
      get_new_CHAT_MAIL_TEXT = appConfigData[getAppConfigKeyDataEleven[0]];
    }
    if (getAppConfigKeyDataTen.length == 0 && getAppConfigKeyDataEleven.length == 0 && getAppConfigKeyDataTwelth.length > 0) {
      get_new_CHAT_MAIL_TEXT = appConfigData[getAppConfigKeyDataTwelth[0]];
    }
    data.AUTO_REPLACE_REF.forEach(item => {
      if (item.TYPE == "HYPERLINK_CHAT") {
        item.DISPLAY_TEXT = get_new_HYPERLINK_Text;
        item.REDIRECT_LINK = get_new_HYPERLINK_Url;
      }
      if (item.TYPE == "HYPERLINK_MAIL") {
        item.DISPLAY_TEXT = get_new_CHAT_MAIL_TEXT;
        item.REDIRECT_LINK = get_new__CHAT_MAIL_ID
      }
    });
    let getFilterChatHyperLink = data.AUTO_REPLACE_REF.filter(item => item.ELEMENT == "[HYPER LINK]");
    let getFilterChatMailId = data.AUTO_REPLACE_REF.filter(item => item.ELEMENT == "[MAIL ID]");
    if (getFilterChatMailId) {
      let _redirectLink = getFilterChatMailId[0] ? getFilterChatMailId[0].REDIRECT_LINK : "";
      if (_redirectLink != undefined) {
        let getActualFormatLink = _redirectLink.replaceAll(_redirectLink, 'mailto:' + _redirectLink)
        let _displayText = getFilterChatMailId[0] ? getFilterChatMailId[0].DISPLAY_TEXT : "";
        let getProperDisplayName = [_displayText];
        if (data && data.CHAT_DESC != undefined) {
          data.CHAT_DESC = data.CHAT_DESC.replaceAll('[MAIL ID]', " " + '[' + getProperDisplayName[0] + ']' + '(' + getActualFormatLink + ')');
        }
      }
    }
    if (getFilterChatHyperLink) {
      let _getRedireckLinks = getFilterChatHyperLink[0] ? getFilterChatHyperLink[0].REDIRECT_LINK : "";
      if (_getRedireckLinks != undefined) {
        let _getDisplayNames = getFilterChatHyperLink[0] ? getFilterChatHyperLink[0].DISPLAY_TEXT : "";
        let getProDisplayName = [_getDisplayNames];
        if (data && data.CHAT_DESC != undefined) {
          data.CHAT_DESC = data.CHAT_DESC.replaceAll('[HYPER LINK]', " " + '[' + getProDisplayName[0] + ']' + '(' + _getRedireckLinks + ')');
        }
      }
    }
    setUIText(responseData);
  }

  const getDomainJSON = callback => {
    axios.get('./domain.json')
      .then((response) => {
        processAutoReplace(response.data, response.data.AUTO_REPLACE_REF, resdata => {
          resdata.AUTO_REPLACE_REF = updateReplaceVariables(response.data.AUTO_REPLACE_REF, response.data.AUTO_REPLACE_REF);
          getDataFromAppService(resdata, async data => {
            let responseData = data;
            let validHyperLinkText = responseData.AUTO_REPLACE_REF.filter(item => item.TYPE === "HYPERLINK_CHAT" && item.DISPLAY_TEXT === undefined && item.REDIRECT_LINK === undefined);
            let validMailIdText = responseData.AUTO_REPLACE_REF.filter(item => item.TYPE === "HYPERLINK_MAIL" && item.DISPLAY_TEXT === undefined && item.REDIRECT_LINK === undefined);
            if (validHyperLinkText.length > 0 || validMailIdText.length > 0) {
              await getAppConfigResponse(responseData);
            } else {
              if (data && data.CHAT_DESC) {
                let getFilterChatHyperLink = data.AUTO_REPLACE_REF.filter(item => item.ELEMENT == "[HYPER LINK]");
                let getFilterChatMailId = data.AUTO_REPLACE_REF.filter(item => item.ELEMENT == "[MAIL ID]");
                if (getFilterChatMailId) {
                  let _redirectLink = getFilterChatMailId[0] ? getFilterChatMailId[0].REDIRECT_LINK : "";
                  if (_redirectLink != undefined) {
                    let getActualFormatLink = _redirectLink.replaceAll(_redirectLink, 'mailto:' + _redirectLink)
                    let _displayText = getFilterChatMailId[0] ? getFilterChatMailId[0].DISPLAY_TEXT : "";
                    let getProperDisplayName = [_displayText];
                    if (data && data.CHAT_DESC != undefined) {
                      data.CHAT_DESC = data.CHAT_DESC.replaceAll('[MAIL ID]', " " + '[' + getProperDisplayName[0] + ']' + '(' + getActualFormatLink + ')');
                    }
                  }
                }
                if (getFilterChatHyperLink) {
                  let _getRedireckLinks = getFilterChatHyperLink[0] ? getFilterChatHyperLink[0].REDIRECT_LINK : "";
                  if (_getRedireckLinks != undefined) {
                    let _getDisplayNames = getFilterChatHyperLink[0] ? getFilterChatHyperLink[0].DISPLAY_TEXT : "";
                    let getProDisplayName = [_getDisplayNames];
                    if (data && data.CHAT_DESC != undefined) {
                      data.CHAT_DESC = data.CHAT_DESC.replaceAll('[HYPER LINK]', " " + '[' + getProDisplayName[0] + ']' + '(' + _getRedireckLinks + ')');
                    }
                  }
                }
              }
            }
            setUIText(responseData);
            try {
              checkAndSetAutoReplace(responseData.AUTO_REPLACE_REF, () => {
              });
            } catch (exc) {
              console.log('DOMAIN SET AUTO COMPLETE DATA ERROR');
            }

            try {
              processAutoReplace(tempGlobalText, autoReplace, data => {
                setGlobalUiText(data);
                console.log("DOMAIN LOADED");
                if (callback) callback();
              });
            } catch (exc) {
              console.log('DOMAIN STATIC AUTO REPLACE ERROR', exc);
            }

            try {
              const prompt = JSON.parse(responseData.PROMPT);
              setPromptQuest([...promptQuest, ...prompt.QUESTIONS]);
            } catch (exc) {
              console.log('PROMPT NOT FOUND!');
            }
          });
        }, true);
      })
      .catch(error => {
        console.log('DOMAIN SPECIFIC STATIC TEXT FILE NOT FOUND!');

        try {
          processAutoReplace(tempGlobalText, autoReplace, data => {
            console.log(globalUiText);
            setGlobalUiText(data);
          });
        } catch (exc) {
          setError(1);
          console.log('DOMAIN STATIC AUTO REPLACE ERROR');
        }
      });
  }


  console.log("theSession", thesessionID)
  console.log("userEmail",userEmail)
  // Function to dynamically create name and description fields
  const populate_dashboardMapFields = (usecase) => {
    return {
      "NAME": `_UI_${usecase.toUpperCase()}_COMMON_CHAT_LABEL`,
      "DESCRIPTION": `_UI_${usecase.toUpperCase()}_COMMON_CHAT_SHORT_DESCRIPTION`,
      "DEFAULT_DOMAIN": `_UI_${usecase.toUpperCase()}_COMMON_DEFAULT_DOMAIN`,
    };
  };

  const getGlobalJSON = (callback) => {
    axios.get('./global.json')
      .then((response) => {
        getDataFromAppService(response.data, data => {
          dashboardMap = JSON.parse(response.data.DASHBOARD_MAP);
          delete response.data.DASHBOARD_MAP;
          // Update dashboardMap
          dashboardMap.USECASES.forEach(usecaseObj => {
            const { USECASE } = usecaseObj;
            const { NAME, DESCRIPTION, DEFAULT_DOMAIN } = populate_dashboardMapFields(USECASE);
            usecaseObj.NAME = NAME;
            usecaseObj.DESCRIPTION = DESCRIPTION;
            usecaseObj.DEFAULT_DOMAIN = DEFAULT_DOMAIN;
          });

          dataPrivacyURL = response.data.DATA_PRIVACY_URL

          processAutoReplace(data, response.data.AUTO_REPLACE_REF, resdata => {
            let responseData = resdata;

            tempGlobalText = responseData;
            setGlobalUiText(responseData);

            try {
              checkAndSetAutoReplace(responseData.AUTO_REPLACE_REF, () => {
                if (callback) callback();
              });
            } catch (exc) {
              console.log('GLOBAL SET AUTO COMPLETE DATA ERROR', exc);
            }

          });

        });
      })
      .catch(error => {
        setError(1);
        console.log('GLOBAL STATIC TEXT FILE NOT FOUND!');

        try {
          processAutoReplace(globalUiText, autoReplace, data => {
            setGlobalUiText(data);
          });
        } catch (exc) {
          console.log('GLOBAL STATIC AUTO REPLACE ERROR')
        }
      });
  }

  const updateReplaceVariables = (autoReplace, autoReplaceRef) => {
    autoReplace.map((key, index) => {
      let res = { ...key };
      delete res.ELEMENT;

      processAutoReplace(res, autoReplaceRef, resdata => {
        autoReplace[index] = { ...key, ...resdata };
      }, true)
    });

    return autoReplace;
  }

  const getDataFromAppService = (response, callback) => {
    let looped = 0;
    for (const [key, value] of Object.entries(response)) {
      if (key !== "AUTO_REPLACE_REF") {
        if (value.charAt(0) == '_') {
          let variable = value.substring(1);
          APPSERVICE.GET(variable,
            (resp) => {
              response[key] = resp;
              if (Object.entries(response).length - 1 == looped) {
                if (callback) {
                  setTimeout(function () {
                    callback(response);
                  }, 100);
                }
              }
              looped++;
            },
            (error) => {
              console.log(error);
              looped++;
            }
          );
        } else {
          looped++;
        }
      } else {
        if (typeof response["AUTO_REPLACE_REF"] != "undefined") {
          response["AUTO_REPLACE_REF"].map((obj, ind) => {
            getDataFromAppService(obj, (data) => { });
          });
        }
        looped++;
      }
    }
  }

  const checkAndSetAutoReplace = (params, callback) => {
    let aReplace = [...autoReplace];

    if (!params) {
      if (callback) callback();
      return;
    }

    if (autoReplace.length === 0) {
      autoReplace = [...params];
      if (callback) callback();
      return;
    }

    aReplace.map((key, index) => {
      let el = key.ELEMENT;

      params.map((k, i) => {
        if (k.ELEMENT == el) {
          aReplace[index] = k;
        }
      });

      if (aReplace.length - 1 === index) {
        if (callback) callback();
      }
      return el 
    });

    autoReplace = aReplace;
  }

  const processAutoReplace = (resp, autoReplaceMap, callback, skipAllias) => {
    const response = resp;

    let processed = {};

    const processData = value => {
      let data = value;
      autoReplaceMap.map((key, index) => {
        let el = key.ELEMENT;

        if (key.TYPE === "HYPERLINK") {
          let rLink = key.REDIRECT_LINK;
          let dText = key.DISPLAY_TEXT;
          if (rLink) {
            if (rLink.indexOf('mailto') > -1) {
              data = data.replaceAll(el, '<a href=\'' + rLink + '\' target="_blank">' + dText + '</a>');
            } else {
              data = data.replaceAll(el, '<a href=\'' + rLink + '\'>' + dText + '</a>');
            }
          }
        } else if (key.TYPE == "HYPERLINK_CHAT") {
          let rHyperLink = key.REDIRECT_LINK;
          let dHyperText = key.DISPLAY_TEXT;
          if (rHyperLink) {
            data = data.replaceAll(el, '<a href=\'' + rHyperLink + '\' target="_blank">' + dHyperText + '</a>');
          }
        }
        else if (key.TYPE == "HYPERLINK_MAIL") {
          let rMailIdLink = key.REDIRECT_LINK;
          let dMailIdText = key.DISPLAY_TEXT;
          if (rMailIdLink) {
            data = data.replaceAll(el, '<a href=\'' + rMailIdLink + '\'>' + dMailIdText + '</a>');
          }
        }
        else if (key.TYPE == "TEXT") {
          let rText = key.REPLACE_WITH;
          data = data.replaceAll(el, rText);
        }
        else if (key.TYPE == "VARIABLE") {
          let rf = key.REF;
          if (rf == 'DOMAIN') {
            if (DOMAIN) {
              if (skipAllias) {
                data = data.replaceAll(el, DOMAIN.toUpperCase());
              } else {
                if (tempAlliasName) {
                  data = data.replaceAll(el, tempAlliasName);
                } else {
                  data = data.replaceAll(el, DOMAIN.toUpperCase());
                }
              }
            }
          } else if (rf == 'USECASE') {
            if (skipAllias) {
              if (USECASE) data = data.replaceAll(el, USECASE.toUpperCase());
            } else {
              if (USECASE) {
                let usecaseAllias = "";
                dashboardMap.USECASES.map((key, index) => {
                  if (key.USECASE == USECASE) {
                    usecaseAllias = key.NAME;
                  }
                });
                data = data.replaceAll(el, usecaseAllias);
              }
            }
          }
        }
      });

      return data;
    }

    for (const [key, value] of Object.entries(response)) {
      if (key !== "AUTO_REPLACE_REF") {
        processed[key] = processData(value);
      }
    }

    if (callback) callback(processed);
  }


  React.useEffect(() => {
    getUserEmailID((response) => {
      const usrEmail = response.data[0].user_id;
      //API.GET_APPCONFIG(process.env.REACT_APP_GUARDRAIL_URL, 'ui_app_configs?user_email=' + `${usrEmail}`,
      API.GET_APPCONFIG("https://emtech-wa-guardrail-all-poc.azurewebsites.net/", 'ui_app_configs?user_email=' + `${usrEmail}`,
        (resp) => {
          APPSERVICE.LOADDATA(resp.data, () => {
            getGlobalConfigResponse = resp.data;
            getGlobalJSON(() => {
              if (!loadDashboard) {
                checkValidUseCase();
                getDomainStaticText();
                getTranslationHubStaticText();
                updateConfigFiles(() => {
                  getEnvironmentJSON(() => {
                    getDomainJSON();
                    authenicateUser();
                  });
                });
              } else {
                updateConfigFiles(() => {
                  authenicateUser();
                });
              }
            });
          });
        },
        (err) => {
          console.error("Failed to run:", err);
          // window.location.reload();
        }
      )
    });

  }, []);

  React.useEffect(() => {
    if (loaded && initLoad) {
      if (allowed) {
        createSession();
        createTranaslationSession();
      }
    }
  }, [loaded]);

  React.useEffect(() => {
    if (sessionList.length) {
      if (activeSessionID && sessionIndex != 0) {
        for (let i = 0; i < sessionList.length; i++) {
          if (sessionList[i].user_session_id == activeSessionID) {
            sessionIndex = i;
            setCurrentSession(sessionIndex);
            setUpdateChatHistory(Math.random());
            setActiveSessionID(null);
            break;
          }
        }
      } else {
        if (initLoad) setLoaded(true);
        setUpdateChatHistory(Math.random());
      }
    } else {
      if (loaded) {
        console.log('NO SESSIONS FOUND FOR THE DOMAIN');
      }
    }
  }, [sessionList]);

  React.useEffect(() => {
    if (sessionTranaslationList.length) {
      if (activeSessionID && sessionIndex != 0) {
        for (let i = 0; i < sessionTranaslationList.length; i++) {
          if (sessionTranaslationList[i].user_session_id == activeSessionID) {
            sessionIndex = i;
            setTranasltionCurrentSession(sessionIndex);
            setUpdateTranaslationHistory(Math.random());
            setActiveSessionID(null);
            break;
          }
        }
      } else {
        if (initLoad) setLoaded(true);
        setUpdateTranaslationHistory(Math.random());
      }
    } else {
      if (loaded) {
        console.log('NO SESSIONS FOUND FOR THE DOMAIN');
      }
    }
  }, [sessionTranaslationList]);


  React.useEffect(() => {
    if (error !== 0) setLoaded(true);

  }, [error]);

  React.useEffect(() => {
    if (domainList.length) {
      let list = {};
      for (let i = 0; i < domainList.length; i++) {
        let alliasStr = 'UI_' + USECASE.toUpperCase() + '_' + (domainList[i].toUpperCase()) + '_ALIAS_NAME';
        APPSERVICE.GET(alliasStr,
          (resp) => {
            list[domainList[i]] = resp;
            if (i == domainList.length - 1) {
              setDomainAllias(list);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
  }, [domainList]);
  
  //FOR NEW SESSION ON LAUNCH IN PRODUCTION
  React.useEffect(() => {
    if (!loadDashboard && allowed) {
      getSessions();
      // getTranaslationSessions();
      getSessionsSDLC();

    }
  }, [allowed]);

  //GET: User Email ID
  const getUserEmailID = (callback) => {

    API.GET_AUTH(
      prodMode ? 'https://' + window.location.hostname + '/.auth/me' : './sample_auth.json',
      (response) => {
        auth_response = response;
        setUserEmail(auth_response.data[0].user_id);
        if (callback) callback(auth_response);
      },
      (error) => {
        console.log('COULD NOT CONNECT TO AUTH SERVICE');
      }
    )
  }

  const authenicateUser = () => {
    if (loadDashboard) {
      setLoaded(true);
    } else {
      if (config.auth) {
        validateUser(auth_response.data, () => {
        });
      } else {
        setAllowed(true);
      }
    }
  }


  //GET: Session List
  const getSessions = () => {
    let aSessions = [];
    setResetState(false);
     const formData = new FormData();
  formData.append("user_email", userEmail);
  formData.append("domain", domain);
    API.POST(
      baseURL,
      `user`,
      formData,
      (response) => {
        if (response.data.length) {
          response.data.map((session, index) => {
          console.log("Getresponse", getSessionsSDLC)

            if (config.groupBy) {
              if (session.timestamp != null) {
                aSessions.push(session);
              }
            } else {
              if (session.timestamp != null) {
                aSessions.push(session);
              } else {
                let _thisSession = session;
                _thisSession.timestamp = new Date();
                aSessions.push(_thisSession);
              }
            }
          });
          if (difference(sessionList, reverseArr(aSessions))) setSessionList(reverseArr(aSessions));
        } else {
          setSessionList([])
          if (allowed) {
            createSession();
            setLoaded(true);
          }
        }
      },
      (error) => {
        console.log(error);
        setLoaded(true);
      }
    )
  }

  const getSessionsSDLC = () => {
  let aSessions = [];
  setResetState(false);

  const formData = new FormData();
  formData.append("user_email", userEmail);
  formData.append("domain", domain);

  API.POST(
    "/user",  
    formData,
    (response) => {
      if (response.data.length) {
        response.data.map((session, index) => {
          console.log("Getresponse", thesessionID);

          if (config.groupBy) {
            if (session.timestamp != null) {
              aSessions.push(session);
            }
          } else {
            if (session.timestamp != null) {
              aSessions.push(session);
            } else {
              let _thisSession = session;
              _thisSession.timestamp = new Date();
              aSessions.push(_thisSession);
            }
          }
        });
        if (difference(sessionList, reverseArr(aSessions))) setSessionList(reverseArr(aSessions));
      } else {
        setSessionList([]);
        if (allowed) {
          createSession();
          setLoaded(true);
        }
      }
    },
    (error) => {
      console.log(error);
      setLoaded(true);
    }
  );
};


  //GET: Session List tranaslation hub
  const getTranaslationSessions = () => {
    let aSessions = [];
    setResetState(false);
    API.GET(
      baseURL,
      'user?user_email=' + `${userEmail}` + '&domain=' + domain,
      (response) => {
        if (response.data.length) {
          response.data.map((session, index) => {
            if (config.groupBy) {
              if (session.timestamp != null) {
                aSessions.push(session);
              }
            } else {
              if (session.timestamp != null) {
                aSessions.push(session);
              } else {
                let _thisSession = session;
                _thisSession.timestamp = new Date();
                aSessions.push(_thisSession);
              }
            }
          });
          if (difference(sessionTranaslationList, reverseArr(aSessions))) setSessionTranaslationList(reverseArr(aSessions));
        } else {
          setSessionTranaslationList([])
          if (allowed) {
            createTranaslationSession();
            setLoaded(true);
          }
        }
      },
      (error) => {
        console.log(error);
        setLoaded(true);
      }
    )
  }


  //Initiate New Session
  const createSession = () => {
    setSessionChatURL(null);
    sessionIndex = null;
    sessionID = null;
    setUpdateChatHistory(Math.random());
    setInitLoad(false);
    setResetState(true);
    setResetMetaTags(true)
  }

  const handleResetMetaTag = () => {
    setResetMetaTags(false);
  };


  const createSessionSDLC = (callback) => {
  const formData = new FormData();
  formData.append("user_email", userEmail);
  formData.append("domain", domain);

  try {
    const response =  API.POST("/user", formData);
    console.log("myData",response)

    const newSession = response?.data;
    if (newSession) {
      setSessions((prev) => [...prev, newSession]);        
      setCurrentSession(newSession);                   
      if (callback) callback(newSession);                    
    }
  } catch (error) {
    console.error("Failed to create session:", error);
  }
};


  //Initiate New Session
  const createTranaslationSession = () => {
    if (isTranslationDone) {
      deleteTranaslationHubSession(getHubSessionId);
      setIsTranslationDone(false);
      setSessionTimeOutMsg("");
      getHubSessionId = null;
    }
    setSessionTranaslationChatURL(null);
    sessionIndex = null;
    sessionID = null;
    setUpdateTranaslationHistory(Math.random());
    setInitLoad(false);
    setResetState(true);
    setSessionName("");
    setSessionTimeOutMsg("");
  }

  //POST: Add a session
  const addNewSession = (callback) => {
    API.POST(
      baseURL,
      'user?user_email=' + `${userEmail}` + '&domain=' + domain,
      {},
      (response) => {
        sessionID = (response.data.session_id ? response.data.session_id : response.data.user_session_id);
        sessionIndex = 0;
        if (callback) callback('chat/' + sessionID + '?user_email=' + `${userEmail}`, () => {
          getSessions();
        });
      },
      (error) => {
        setLoaded(true);
        console.log(error);
      }
    )
  }

  //POST: Add a session using FormData
//   const addNewSessionSDLC = (callback) => {
//   const formData = new FormData();
//   formData.append("user_email", userEmail);
//   formData.append("domain", domain);

//   API.POST(
//     baseURL,
//     'user', 
//     formData,
//     (response) => {
//       console.log("addNewSessionSDLC response", response)
//       sessionID = response.data.session_id || response.data.user_session_id;
//       const createdSessionID = sessionID
//       console.log("sessionID" , sessionID)
//       sessionIndex = 0;
//       if (callback) callback('user/' + sessionID + '?user_email=' + `${userEmail}`, () => {
//         getSessionsSDLC();
//       });
//     },
//     (error) => {
//       setLoaded(true);
//       console.log(error);
//     }
//   );
// }

const addNewSessionSDLC = (callback) => {
  const formData = new FormData();
  formData.append("user_email", userEmail);
  formData.append("domain", domain);

  API.POST(
    baseURL,
    'user', 
    formData,
    (response) => {
      console.log("addNewSessionSDLC response", response);
      const createdSessionId = response.data.user_session_id ;
      sessionID = createdSessionId; 
      setTheSessionID(sessionID)
      sessionIndex = 0;
      setSessionList(prev=>[...prev,response.data.timestamp])
      if (callback) callback(createdSessionId);
    },
    (error) => {
      setLoaded(true);
      console.log(error);
    }
  );
};


console.log( "theSession", thesessionID)
console.log("userKa", userEmail)


  //POST: Rename a Session
  const renameSession = (session_name, session_ID) => {
    const data = {
      "user_session_name": session_name
    }
    setLoaded(false);
    API.POST(
      baseURL,
      'user/' + session_ID + '/rename?user_email=' + `${userEmail}` + '&domain=' + domain,
      data,
      (response) => {
        toast.success(globalUiText.SESSION_RENAME, {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
        getSessions();
        setLoaded(true);
      },
      (error) => {
        console.log(error);
        setLoaded(true);
      }
    )
  }

  //POST: Rename a Session of Tranaslation hub
  const renameTranaslationHubSession = (session_name, session_ID) => {
    const data = {
      "user_session_name": session_name,
      "user_email": userEmail,
      "domain": domain
    }
    setLoaded(false);
    API.POST(
      baseURL,
      'user/' + session_ID + '/rename?user_email=' + `${userEmail}` + '&domain=' + domain,
      data,
      (response) => {
        toast.success(globalUiText.SESSION_RENAME, {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
        getTranaslationSessions();
        setLoaded(true);
      },
      (error) => {
        console.log(error);
        setLoaded(true);
      }
    )
  }

// using FormData
const renameSessionSDLC = (session_name, thesessionID) => {
  const formData = new FormData();
  formData.append("user_session_name", session_name);
  formData.append("user_email", userEmail);
  formData.append("domain", domain);

  setLoaded(false);
  API.POST(
    baseURL,
    `user/${thesessionID}/rename`, 
    formData,
    (response) => {
      toast.success(globalUiText.SESSION_RENAME, {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        autoClose: 2000,
        closeButton: false
      });
      getSessionsSDLC();
      setLoaded(true);
    },
    (error) => {
      console.log(error);
      setLoaded(true);
    }
  );
}

  //POST: Delete a Session
  const deleteSession = (session_ID) => {
    if (!config.delete) {
      toast.warning(globalUiText.DELETE_ENABLE_WARNING, {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        autoClose: 2000,
        closeButton: false
      });
      return;
    }
    setLoaded(false);
    API.DELETE(
      baseURL,
      'chat/' + session_ID + '?user_email=' + `${userEmail}` + '&domain=' + domain,
      (response) => {
        toast.success(globalUiText.SESSION_DELETE_SUCCESS, {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
        getSessions();
        setLoaded(true);
      },
      (error) => {
        console.log(error);
        setLoaded(true);
      }
    )
  }

  //POST: Delete a Session of Tranaslation hub
  const deleteTranaslationHubSession = (session_ID) => {
    if (!config.delete) {
      toast.warning(globalUiText.DELETE_ENABLE_WARNING, {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        autoClose: 2000,
        closeButton: false
      });
      return;
    }
    setLoaded(false);
    API.DELETE(
      baseURL,
      'chat/' + session_ID + '?user_email=' + `${userEmail}` + '&domain=' + domain,
      (response) => {
        toast.success(globalUiText.SESSION_DELETE_SUCCESS, {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
        getTranaslationSessions();
        setLoaded(true);
      },
      (error) => {
        console.log(error);
        setLoaded(true);
      }
    )
  }

  //POST: Delete a Session using FormData
  const deleteSessionSDLC = (thesessionID) => {
  if (!config.delete) {
    toast.warning(globalUiText.DELETE_ENABLE_WARNING, {
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: true,
      autoClose: 2000,
      closeButton: false
    });
    return;
  }

  setLoaded(false);

  const formData = new FormData();
  formData.append("user_email", userEmail);
  formData.append("domain", domain);
  formData.append("session_id", thesessionID);

  API.DELETE(
    baseURL,
    'user',         
    formData,       
    (response) => {
      toast.success(globalUiText.SESSION_DELETE_SUCCESS, {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        autoClose: 2000,
        closeButton: false
      });
      getSessionsSDLC();  
      setLoaded(true);
    },
    (error) => {
      console.log(error);
      setLoaded(true);
    }
  );
};

  //POST: Feedback Change
  const onRateChange = (rating) => {
    const rateValue = rating.rating ? 'Up' : 'Down';
    const data = {
      "user_email": userEmail,
      "domain": domain
    }
    API.POST(
      baseURL,
      'chat/' + sessionID + '/Thumbs/' + rating.rateID + '?Thumbs=' + rateValue,
      data,
      (response) => {
        toast.success("Your feedback has been submitted", {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
      },
      (error) => {
        console.log(error);
      }
    )
  }



  //POST: Upload files
  const uploadFile = (file, callback) => {
    const formData = new FormData();
    formData.append("file", file);
    let user_session_id = sessionIndex != null ? sessionList[sessionIndex].user_session_id : null;
    if (user_session_id == null) {
      addNewSession((_path, _callback) => {
        user_session_id = sessionID;
        API.UPLOAD(
          baseURL,
          'upload/' + user_session_id + '?user_email=' + `${userEmail}` + '&domain=' + `${domain}`,
          formData,
          (response) => {
            toast.success(globalUiText.FILE_UPLOAD_SUCCESS, {
              position: toast.POSITION.TOP_RIGHT,
              hideProgressBar: true,
              autoClose: 2000,
              closeButton: false
            });
            if (callback) callback(response);
            getSessions();
          },
          (error) => {
            toast.error(error.response.data.error, {
              position: toast.POSITION.TOP_RIGHT,
              hideProgressBar: true,
              autoClose: 2000,
              closeButton: false
            });
            if (callback) callback(false);
            console.log(error);
          }
        );
        if (_callback) _callback();
      })
    } else {
      API.UPLOAD(
        baseURL,
        'upload/' + user_session_id + '?user_email=' + `${userEmail}` + '&domain=' + `${domain}`,
        formData,
        (response) => {
          toast.success(globalUiText.FILE_UPLOAD_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
          if (callback) callback(response);
          getSessions();
        },
        (error) => {
          toast.error(error.response.data.error, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
          if (callback) callback(false);
          console.log(error);
        }
      )
    }
  }

  //POST: Validate User
  const validateUser = async (p_Auth_Str, callback) => {
    if (USECASE && USECASE.toUpperCase() === "CAS") {
      //GET: Meta tag list
      const userEmail = p_Auth_Str[0].user_id;
      await new Promise((resolve, reject) => {
        API.GET(
          baseURL,
          `tags?user_email=${userEmail}&domain=${domain}`,
          (response) => {
            if (response.data) {
              setMetaTagList(response.data);
              setSelectedTagName(response.data.tag_name);
            }
            resolve();
          },
          (error) => {
            console.log("Error fetching tags:", error);
            reject(error);
          }
        );
      });
    }
    // if (USECASE == "supportbot") {
    //   baseURL = "https://emtech-wabackend-blp-all-poc.azurewebsites.net/";
    // }

   let data;
 
    if (USECASE && USECASE.toUpperCase() === "SDLC") {
      data = new FormData();
      data.append("user_email", p_Auth_Str[0].user_id);
      data.append("domain", DOMAIN);
      console.log(data);
    } else {
      data = {
        use_case: USECASE,
        domain: DOMAIN,
        auth_str: p_Auth_Str,
        user_email: p_Auth_Str[0].user_id
      };
    }

    API.POST(
      baseURL,
      'user/active_directory/validate',
      data,
      (response) => {
        setSasToken(response.data.blob_sas_token);
        setShowAck(!response.data.is_privacy_statement_signed);
        if (typeof response.data.Error !== 'undefined') {
          setError(2);
        }
        else if (typeof response.data.access !== 'undefined') {
          setGetValidateActiveDirectory(response.data);
          if (!response.data.access) {
            if (typeof response.data.domain_list !== 'undefined') {
              setURIDomain(response.data.domain_list[0]);
            } else {
              setError(3);
            }
          } else {
            if (typeof response.data.domain_list !== 'undefined') {
              setDomainList(response.data.domain_list);
            }
            setAllowed(true);
          }
        } else {
          if (!response.data.domain.length) {
            setError(2);
          } else {
            if (typeof response.data.domain_list !== 'undefined') {
              setDomainList(response.data.domain_list);
            }
            setAllowed(true);
          }
        }
        if (callback) callback();
      },
      (error) => {
        console.log('COULD NOT VALIDATE', DOMAIN);
        setError(3);
        if (callback) callback();
      }
    );
  }

  const checkValidUseCase = () => {
    if (typeof dashboardMap.USECASES != "undefined") {
      let validUseCase = false;
      for (let i = 0; i < dashboardMap.USECASES.length; i++) {
        if (dashboardMap.USECASES[i].USECASE == USECASE) {
          validUseCase = true;
          break;
        }
      }
      if (!validUseCase) {
        setError(1);
        authenicateUser();
      }
    }
  }

  const shorthandUserEmail = () => {
    const userFullName = userEmail.split('@')[0],
      userName = userFullName.split('.')[0],
      userSurname = userFullName.split('.')[userFullName.split('.').length - 1];
    return userName.charAt(0).toUpperCase() + '' + (userFullName.split('.').length > 1 ? userSurname.charAt(0).toUpperCase() : "");
  }

  const reverseArr = (input) => {
    var ret = new Array;
    for (var i = input.length - 1; i >= 0; i--) {
      ret.push(input[i]);
    }
    return ret;
  }

  const setCurrentSession = (index) => {
    sessionIndex = index ? index : 0;
    try {
      sessionID = sessionList[sessionIndex].user_session_id;
      setSessionName(sessionList[sessionIndex].user_session_name.split('"').join(''));
      setSessionChatURL(baseURL + "/user");
      setSession(sessionList[sessionIndex]);
    } catch (exc) {
      console.log(exc);
    }
  }

//   const setCurrentSessionSDLC = async (index) => {
//   const selectedIndex = index !== undefined && index !== null ? index : 0;
//   sessionIndex = selectedIndex;

//   try {
//     const selectedSession = sessionList[sessionIndex];
//     sessionID = selectedSession.user_session_id;
//     const sessionNameCleaned = selectedSession.user_session_name.split('"').join('');

//     setSessionName(sessionNameCleaned);
//     setSessionChatURL(`${baseURL}/${sessionID}?user_email=${userEmail}`);
//     setSession(selectedSession);

//     // Create and send FormData
//     const formData = new FormData();
//     formData.append("user_email", userEmail);
//     formData.append("domain", domain); 
//     formData.append("session_id", sessionID);

//     API.POST("/user/", formData);

//   } catch (err) {
//     console.log("Error in setCurrentSession:", err);
//   }
// };


  const setTranasltionCurrentSession = (index) => {
    sessionIndex = index ? index : 0;
    try {
      sessionID = sessionTranaslationList[sessionIndex].user_session_id;
      setSessionName(sessionTranaslationList[sessionIndex].user_session_name.split('"').join(''));
      setSessionTranaslationChatURL(baseURL + 'tranaslation/' + sessionID + '?user_email=' + `${userEmail}`);
      setSession(sessionTranaslationList[sessionIndex]);
      setSessionTimeOutMsg("");
    } catch (exc) {
      console.log(exc);
    }
  }

  const difference = (arrayOne, arrayTwo) => {
    let differenceFound = false;
    if (arrayOne.length === arrayTwo.length) {
      arrayOne.map((session, index) => {
        if (session.user_session_name.split('"').join('') != arrayTwo[index].user_session_name.split('"').join('')) {
          if (!differenceFound) differenceFound = true;
        }
      });
    } else {
      differenceFound = true;
    }

    return differenceFound;
  }

  const showHistory = () => {
    setShowHistoryclosed(!showHistoryclosed);
  }


  const showTranasltionHistory = () => {
    setShowHistoryTranaslationclosed(!showHistoryTranaslationclosed);
  }


  const setURIDomain = (value) => {
    var re = new RegExp("([?&])" + 'domain' + "=.*?(&|$)", "i");
    var separator = window.location.href.indexOf('?') !== -1 ? "&" : "?";
    if (window.location.href.match(re)) {
      window.location = window.location.href.replace(re, '$1' + 'domain' + "=" + value + '$2');
    }
    else {
      window.location = window.location.href + separator + "domain" + "=" + value;
    }
  }

  const [subFeature, setSubFeature] = useState(kChart);

  const handleSubFeatureSelection = (selectedFeature) => {
    setSubFeature(selectedFeature)
    let heading = "Chat"
    if (selectedFeature === kChart) {
      if (sessionList > 0) {
        setCurrentSession(sessionIndex ?? 0);
      }
      heading = staticText["CHAT_SECTION_LABEL"]
      toast.dismiss()
    } else if (selectedFeature === kDiscover) {
      setSessionName("");
      heading = staticText["DISCOVER_LABEL"]
    } else if (selectedFeature === kInsights) {
      setSessionName("");
      heading = staticText["INSIGHTS_LABEL"]
      toast.dismiss()
    } else if (selectedFeature === kModelling) {
      setSessionName("");
      heading = staticText["MODELLING_LABEL"]
      toast.dismiss()
    } else if (selectedFeature === kTranaslationHub) {
      setTranasltionCurrentSession(sessionIndex ?? 0);
      heading = staticText["TRANASLATION_HUB_LABEL"]
      toast.dismiss()
    }

    setUIText({
      ...uiText,
      CHAT_LABEL: heading
    })
  }

  const onAcknowledge = (callback) => {
    const data = {
      "user_email": userEmail,
      "domain": DOMAIN
    }

    API.POST(
      dataPrivacyURL,
      'user/privacy_statement/sign',
      data,
      (response) => {
        if (callback) callback();
        toast.success("Terms are acknowledged successfully!", {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
      },
      (error) => {
        console.log('COULD NOT ACKNOWLEDGE');
        setError(3);
        if (callback) callback();
      }
    );
  }


  const uploadFileHub = async (file, isGlossary, callback) => {
    if (getHubSessionId == null && USECASE == 'thub') {
      const data = {
        "user_email": userEmail,
        "domain": DOMAIN
      }
      await API.POST(
        baseURL,
        'user?user_email=' + `${userEmail}` + '&domain=' + domain,
        data,
        (response) => {
          if (response) {
            getHubSessionId = response.data ? response.data.user_session_id : null;
            sessionID = getHubSessionId;
            if (callback) callback(response);
            const getFileName = file ? file.name : "";
            setResetState(false);
            setSessionTranaslationChatURL(null);
            renameHubTranaslationSession(getFileName, getHubSessionId);
            validateFileUpload(file, isGlossary, callback);
            setIsTranslationDone(true);
          }
        },
        (error) => {
          if (error) {
            console.log('error', error);
          }
        }
      );
    } else {
      validateFileUpload(file, isGlossary, callback);
    }
  }

  //POST: Rename a Session of Tranaslation hub
  const renameHubTranaslationSession = (session_name, session_ID) => {
    const data = {
      "user_session_name": session_name,
      "user_email": userEmail,
      "domain": domain
    }
    setLoaded(false);
    API.POST(
      baseURL,
      'user/' + session_ID + '/rename?user_email=' + `${userEmail}` + '&domain=' + domain,
      data,
      (response) => {
        getTranaslationSessions();
        setLoaded(true);
      },
      (error) => {
        console.log(error);
        setLoaded(true);
      }
    )
  }
  







  const validateFileUpload = async (file, isGlossary, callback) => {
    setLoaded(false);
    if (isGlossary) {
      const formData = new FormData();
      formData.append('user_email', userEmail);
      formData.append('user_session_id', getHubSessionId);
      formData.append('glossary', 'True');
      formData.append('file', file);
      formData.append('domain', domain);
      API.UPLOAD(
        baseURL,
        'sourcefile_upload',
        formData,
        (response) => {
          getFileUploadedGlossaryData = response.data.glossary_url;
          let dataFile = {
            "file_Name": file ? file.name : "",
            "file_Url": getFileUploadedGlossaryData,
            "Glossary": true
          }
          getTranaslationUloadedFile.push(dataFile);
          setResetState(false);
          setSessionTranaslationChatURL(null);
          setLoaded(true);
          toast.success(globalUiText.FILE_UPLOAD_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
          if (callback) callback(response);
          getTranaslationSessions();
        },
        (error) => {
          setResetState(false);
          setSessionTranaslationChatURL(null);
          setLoaded(true);
          toast.error(error.response.data.error, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
          if (callback) callback(false);
          console.log(error);
        }
      )
    } else {
      const formData = new FormData();
      formData.append('user_email', userEmail);
      formData.append('user_session_id', getHubSessionId);
      formData.append('glossary', 'False');
      formData.append('file', file);
      formData.append('domain', domain);
      API.UPLOAD(
        baseURL,
        'sourcefile_upload',
        formData,
        (response) => {
          const _getData = response.data.blob_url;
          getFileUploadedData.push(_getData);
          let dataFile = {
            "file_Name": file ? file.name : "",
            "file_Url": _getData,
            "Glossary": false
          }
          getTranaslationUloadedFile.push(dataFile);
          setSessionTranaslationChatURL(null);
          setLoaded(true);
          setIsFileUploaded(true);
          toast.success(globalUiText.FILE_UPLOAD_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
          if (callback) callback(response);
          getTranaslationSessions();
        },
        (error) => {
          setSessionTranaslationChatURL(null);
          setLoaded(true);
          toast.error(error.response.data.error, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
          if (callback) callback(false);
          console.log(error);
        }
      )
    }
  }


  const normalizeFilename = (str) => {
    return str.replace(/[\s_]+/g, '').toLowerCase().trim();
  };


  const fileToDeleted = (filenameToDelete) => {
    let updatedList = getFileUploadedData.filter(item => {
      const filename = item.split('|')[1];
      return normalizeFilename(filename) !== normalizeFilename(filenameToDelete);
    });
    const seen = new Set();
    updatedList = updatedList.filter(item => {
      const filename = item.split('|')[1];
      const normalized = normalizeFilename(filename);
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
    getFileUploadedData = updatedList;
    if (getFileUploadedData.length === 0) {
      setIsFileUploaded(false);
    }
  };




  const updateUploadedFile = (data) => {
    getTranaslationUloadedFile = [];
    getTranaslationUloadedFile = data;
  }

  const submitTranaslationHub = (data) => {
    setLoaded(false);
    let getExistingFileData = [];
    let uniqueFileUploadedData = getFileUploadedData.filter((value, index, self) => self.indexOf(value) === index);
    let getUniqueTranslationFile = getTranaslationUloadedFile.filter(file => !file.Glossary);
    if (getUniqueTranslationFile.length != uniqueFileUploadedData.length) {
      getUniqueTranslationFile.forEach(item => {
        for (let i = 0; i < uniqueFileUploadedData.length; i++) {
          if ((item == uniqueFileUploadedData[i]) || (item.file_Url == uniqueFileUploadedData[i])) {
            getExistingFileData.push(uniqueFileUploadedData[i]);
          }
        }
      });
    } else {
      getExistingFileData = uniqueFileUploadedData;
    }
    const _getDestinationLanguage = data ? data.dest_language : "";
    const commaSeparatedLanguage = _getDestinationLanguage.join(',');
    const _uploadedFile = getExistingFileData;
    const commaSeparatedUploadedFile = _uploadedFile.join(',');
    if (data.glossary) {
      formDataSet = {
        "user_email": userEmail,
        "user_session_id": getHubSessionId,
        "domain": domain,
        "blob_list": commaSeparatedUploadedFile,
        "dest_language": commaSeparatedLanguage,
        "glossary": 'True',
        "glossary_url": getFileUploadedGlossaryData,
      }
    } else {
      formDataSet = {
        "user_email": userEmail,
        "user_session_id": getHubSessionId,
        "domain": domain,
        "blob_list": commaSeparatedUploadedFile,
        "dest_language": commaSeparatedLanguage,
        "glossary": 'False',
        "glossary_url": ""
      }
    }
    API.POST(
      baseURL,
      'translation_status?user_session_id=' + getHubSessionId,
      formDataSet,
      (response) => {
        let _dataResponse = response?.data;
        setHubTranaslationData(_dataResponse);
        setSessionTranaslationChatURL(baseURL + 'tranaslation/' + getHubSessionId + '?user_email=' + `${userEmail}`);
        setGetSessionID(getHubSessionId);
        getHubSessionId = null;
        getTranaslationUloadedFile = [];
        getFileUploadedData = [];
        setResetState(false);
        setLoaded(true);
        setIsTranslationDone(false);
        setIsFileUploaded(false);
        toast.success(globalUiText.FILE_UPLOAD_SUCCESS, {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
      },
      (error) => {
        getHubSessionId = null;
        setResetState(false);
        setLoaded(true);
        setIsTranslationDone(false);
        setIsFileUploaded(false);
        if ((error?.message == "Network Error") || (error?.message === "Request failed with status code 504") || (error?.name == "AxiosError") || (error?.response?.data == undefined)) {
          let _dataResponse = "Network Error";
          setHubTranaslationData(_dataResponse);
          setSessionTranaslationChatURL(baseURL + 'tranaslation/' + getHubSessionId + '?user_email=' + `${userEmail}`);
          setGetSessionID(getHubSessionId);
          getHubSessionId = null;
          getTranaslationUloadedFile = [];
          getFileUploadedData = [];
          setResetState(false);
          setLoaded(true);
          setIsTranslationDone(false);
          const _msgDisplay = "Network Error";
          setSessionTimeOutMsg(_msgDisplay);
          toast.error("The translation is taking longer than expected. Please revisit the session again later or reduce the file size and start a new session.", {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
        } else {
          toast.error(error?.response?.data?.error, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
        }
        console.log(error);
      }
    )
  }


  //POST: Feedback Change Tranaslation Hub
  const onRateChangeTranaslationHub = (rating) => {
    setLoaded(false);
    const rateValue = rating.rating ? 'Up' : 'Down';
    const rateChatId = rating.chatId;
    const data = {
      "user_email": userEmail,
      "domain": domain
    }
    API.POST(
      baseURL,
      'chat/' + rateChatId + '/Thumbs/' + rateChatId + '?Thumbs=' + rateValue,
      data,
      (response) => {
        setLoaded(true);
        toast.success("Your feedback has been submitted", {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
      },
      (error) => {
        setLoaded(true);
        toast.error(error.response.data.error, {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
        console.log(error);
      }
    )
  }


  //POST: Feedback Change Tranaslation Hub
  const onRateChangeTranaslationHubComments = (rating) => {
    setLoaded(false);
    const rateChatId = rating.chatId;
    const thumbsFeedback = rating.thumbs_feedback
    const data = {
      "user_email": userEmail,
      "domain": domain
    }
    API.POST(
      baseURL,
      'chat/' + rateChatId + '/thumbs_feedback/' + rateChatId + '?thumbs_feedback=' + thumbsFeedback,
      data,
      (response) => {
        setLoaded(true);
        toast.success("Your feedback has been submitted", {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
      },
      (error) => {
        setLoaded(true);
        toast.error(error.response.data.error, {
          position: toast.POSITION.TOP_RIGHT,
          hideProgressBar: true,
          autoClose: 2000,
          closeButton: false
        });
        console.log(error);
      }
    )
  }

  const handleSelectedTagValues = (data) => {
    setSelectedTagValues(data);
  };

  const handleSupportBot = (isChecked) => {
    if (isChecked == true) {
      setVisibleSupportBot(false);
    } else {
      setVisibleSupportBot(true);
    }
  }


  return (
    <div className="App">
      <ToastContainer />
      <DataInsightsProvider uiConfig={staticText} appConfig={uiText} loaded={setLoaded}>
        <div className="chat-container">
          <main className="main">
            {loadDashboard && typeof dashboardMap.USECASES != 'undefined' ? <Dashboard useCases={dashboardMap} uiText={globalUiText}></Dashboard> : <></>}

            <Box sx={{ display: "flex", flexDirection: 'column', width: '100%' }}>
              {
                typeof dashboardMap.USECASES != 'undefined' ? <Header sessionName={sessionName} key={'h-' + sessionName + domainAllias} userName={shorthandUserEmail} setURIDomain={setURIDomain} domain={domain} domainlist={domainList} uiText={uiText} errorType={error} loadDashboard={loadDashboard} useCases={dashboardMap} domainAllias={domainAllias} initLoad={initLoad} globalUiText={globalUiText} metaTagList={metaTagList} selectedTagName={selectedTagName} handleSelectedTagValues={handleSelectedTagValues} selectedTagValues={selectedTagValues} resetMetaTags={resetMetaTags} handleResetMetaTag={handleResetMetaTag} useCaseChatBot={USECASE} handleSupportBot={handleSupportBot}></Header> : <></>
              }

              {error ? <Error errorType={error} uiText={globalUiText} domainAllias={domainAllias[DOMAIN]}></Error> : <></>}

              <Loader isLoaded={loaded} uiText={globalUiText}></Loader>
              {!loadDashboard && showAck ? <Acknowledge onAcknowledge={onAcknowledge}></Acknowledge> : <></>}

              {!loadDashboard &&

                <Box sx={{ display: "flex", flexDirection: 'row', width: '100%', height: 'calc(100% - 151px)' }}>

                  {(config?.sideBar ?? false) &&
                    <>
                      <SideBar handleSubFeatureSelection={handleSubFeatureSelection} selectedSubFeature={subFeature} config={config} />

                      {subFeature === kChart &&
                        <>
                          <ChatHistory showHistory={showHistoryclosed} chatSessions={sessionList} updateSession={setCurrentSession} createSession={createSession} renameSession={renameSession} showHistoryToggle={showHistory} config={config} key={updateChatHistory} sessionIndex={sessionIndex} deleteSession={deleteSession} initLoad={initLoad}></ChatHistory>
                          <Chat sessionChatPath={sessionChatURL} showHistory={showHistory} key={'c-' + sessionChatURL + (typeof session != "undefined" ? typeof session.file_name != 'undefined' ? session.file_name : "" : "")} createSession={createSession} onRate={onRateChange} userName={shorthandUserEmail} getName={getSessions} config={config} promptQuest={promptQuest} domain={domain} usecase={USECASE} dashboardMap={dashboardMap} alliasName={alliasName} uiText={uiText} globalUiText={globalUiText} baseURL={baseURL} path={'chat/' + sessionID + '?user_email=' + `${userEmail}`} loaded={setLoaded} upload={uploadFile} session={sessionList[sessionIndex]} addNewSession={addNewSession} setActiveSessionID={setActiveSessionID} sessionID={sessionID} resetStates={resetStates} user_email={userEmail} selectedTagName={selectedTagName} handleSelectedTagValues={handleSelectedTagValues} selectedTagValues={selectedTagValues}></Chat>
                        </>
                      }
                      {subFeature === kDiscover &&
                        <Discover sessionID={sessionID ?? `session${Date.now()}`} baseUrl={baseURL} domain={domain} uiText={uiText} errorType={error} userEmail={userEmail} globalUiText={globalUiText} />
                      }
                      {subFeature === kInsights &&
                        <Insights sessionID={sessionID ?? `session${Date.now()}`} baseUrl={baseURL} domain={domain} uiText={uiText} errorType={error} userEmail={userEmail} globalUiText={globalUiText} />
                      }
                      {subFeature === kModelling &&
                        <DataModelling sessionID={sessionID ?? `session${Date.now()}`} baseUrl={baseURL} domain={domain} uiText={uiText} errorType={error} userEmail={userEmail} globalUiText={globalUiText} setSubFeature={handleSubFeatureSelection} />
                      }
                    </>
                  }
                  {(!(config?.sideBar ?? false) && USECASE === "thub") &&
                    <>
                      <TranaslationHubHistory showTranasltionHistory={showHistoryTranaslationclosed} tranaslationSessions={sessionTranaslationList} updateSession={setTranasltionCurrentSession} createSession={createTranaslationSession} renameTranaslationHubSession={renameTranaslationHubSession} deleteTranaslationHubSession={deleteTranaslationHubSession} showHistoryTranaslationHubToggle={showTranasltionHistory} config={config} key={updateTranaslationHistory} sessionIndex={sessionIndex} initLoad={initLoad}></TranaslationHubHistory>
                      <TranaslationHub sessionTranaslationPath={sessionTranaslationURL} showTranasltionHistory={showTranasltionHistory} key={'c-' + sessionTranaslationURL + typeof session != "undefined"} keyRef={'k-' + sessionTranaslationURL + typeof session != "undefined"} createSession={createTranaslationSession} onRate={onRateChangeTranaslationHub} onRateComments={onRateChangeTranaslationHubComments} userName={shorthandUserEmail} getName={getTranaslationSessions} config={config} domain={domain} usecase={USECASE} dashboardMap={dashboardMap} alliasName={alliasName} uiText={uiText} globalUiText={globalUiText} baseURL={baseURL} loaded={setLoaded} session={sessionTranaslationList[sessionIndex]} addNewSession={addNewSession} getSessionID={getSessionID} sessionID={sessionID} resetStates={resetStates} user_email={userEmail} staticTranslationHubText={staticTranslationHubText} getValidateActiveDirectory={getValidateActiveDirectory} isGlossary={isGlossary} uploadFileHub={uploadFileHub} submitTranaslationHub={submitTranaslationHub} hubTranaslationData={hubTranaslationData} getTranaslationUloadedFile={getTranaslationUloadedFile} updateUploadedFile={updateUploadedFile} sessionTimeOutMsg={sessionTimeOutMsg} isFileUploaded={isFileUploaded} fileToDeleted={fileToDeleted}></TranaslationHub>
                    </>
                  }
                  {(!(config?.sideBar ?? false) && !["thub", "supportbot", "sdlc"].includes(USECASE)) &&
                    <>
                      <ChatHistory showHistory={showHistoryclosed} chatSessions={sessionList} updateSession={setCurrentSession} createSession={createSession} renameSession={renameSession} showHistoryToggle={showHistory} config={config} key={updateChatHistory} sessionIndex={sessionIndex} deleteSession={deleteSession} initLoad={initLoad}></ChatHistory>
                      <Chat sessionChatPath={sessionChatURL} showHistory={showHistory} key={'c-' + sessionChatURL + (typeof session != "undefined" ? typeof session.file_name != 'undefined' ? session.file_name : "" : "")} keyRef={'k-' + sessionChatURL + (typeof session != "undefined" ? typeof session.file_name != 'undefined' ? session.file_name : "" : "")} createSession={createSession} onRate={onRateChange} userName={shorthandUserEmail} getName={getSessions} config={config} promptQuest={promptQuest} domain={domain} usecase={USECASE} dashboardMap={dashboardMap} alliasName={alliasName} uiText={uiText} globalUiText={globalUiText} baseURL={baseURL} path={'chat/' + sessionID + '?user_email=' + `${userEmail}`} loaded={setLoaded} upload={uploadFile} session={sessionList[sessionIndex]} addNewSession={addNewSession} setActiveSessionID={setActiveSessionID} sessionID={sessionID} resetStates={resetStates} user_email={userEmail} selectedTagName={selectedTagName} handleSelectedTagValues={handleSelectedTagValues} selectedTagValues={selectedTagValues}></Chat>
                    </>
                  }

                  {/* {(!(config?.sideBar ?? false) && USECASE === "supportbot" && visibleSupportBot) &&
                    <>
                      <SupportBotVoice config={config} promptQuest={promptQuest} domain={domain} usecase={USECASE} alliasName={alliasName} uiText={uiText} globalUiText={globalUiText} baseURL={baseURL} loaded={setLoaded} userEmail={userEmail}></SupportBotVoice>
                    </>
                  } */}

                  {/* {(!(config?.sideBar ?? false) && USECASE === "supportbot" && !visibleSupportBot) &&
                    <>
                      <SupportBotChat config={config} promptQuest={promptQuest} domain={domain} usecase={USECASE} alliasName={alliasName} uiText={uiText} globalUiText={globalUiText} baseURL={baseURL} loaded={setLoaded} userEmail={userEmail}></SupportBotChat>
                    </>
                  } */}

                   {(!(config?.sideBar ?? false) && USECASE == "sdlc") &&
                                      <>
                                        {/* <SDLCChatHistory showHistory={showHistoryclosed} chatSessions={sessionList} updateSession={setCurrentSession} createSession={createSDLCSession} renameSession={renameSession} showHistoryToggle={showHistory} config={config} key={updateChatHistory} sessionIndex={sessionIndex} deleteSession={deleteSession} initLoad={initLoad}></SDLCChatHistory> */}
                                         <ChatHistory  sessionList={sessionList} showHistory={showHistoryclosed} chatSessions={sessionList} updateSession={setCurrentSession} createSession={createSession} renameSession={renameSessionSDLC} showHistoryToggle={showHistory} config={config} key={updateChatHistory} sessionIndex={sessionIndex} deleteSession={deleteSessionSDLC} initLoad={initLoad} baseURL={baseURL} path={'/user' + thesessionID + '?user_email=' + `${userEmail}`} userEmail={userEmail} thesessionID={thesessionID}></ChatHistory>
                                         <SDLCChat    sessionChatPath={sessionChatURL} setSessionList={setSessionList} config={config} sessionIndex={sessionIndex} initLoad={initLoad} userName={shorthandUserEmail} promptQuest={promptQuest} domain={domain} usecase={USECASE} showHistory={showHistory} dashboardMap={dashboardMap} alliasName={alliasName} uiText={uiText} globalUiText={globalUiText} baseURL={baseURL} path={'/user' + thesessionID + '?user_email=' + `${userEmail}`} loaded={setLoaded} upload={uploadFile} createSession={createSessionSDLC} session={sessionList[sessionIndex]} addNewSession={addNewSessionSDLC} thesessionID={thesessionID} setActiveSessionID={setActiveSessionID} sessionID={sessionID} resetStates={resetStates} user_email={userEmail} getName={getSessionsSDLC}></SDLCChat> 
                                      </>
                                    }
                </Box>
              }
            </Box>
          </main>
        </div>
      </DataInsightsProvider>
    </div>
  );
}

export default App;
