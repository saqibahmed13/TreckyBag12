import {
    Box,
    FormControl,
    MenuItem,
    Select,
    Typography,
    Button,
    Tab,
    Tabs,
    Divider,
    FormControlLabel,
    Checkbox,
    Slider,
    Alert,
    AlertTitle,
  } from "@mui/material";
  import { toast, ToastContainer } from 'react-toastify';
  import classes from "./InsightsContainer.module.css";
  import insightsBlueIcon from "./assets/insightsBlue.svg";
  import { useContext, useEffect, useRef, useState } from "react";
  import { DataInsightsContext } from "./DataInsightsContext";
  import API from "../../utils/api.service";
  import removeIcon from "./assets/remove.png";
  import addIcon from "./assets/circle-plus.png";
  import saveIcon from "./assets/circle-save.png";
  import { kChart } from "./Utility/Constants";
  import { decreaseOpacity, getSasToken, handleDownload } from "./Utility/Util";


  const DataModellingEditRelation = (props) => {
    const fileStatus = props.selectedFiles
    const dataInfo = useContext(DataInsightsContext);
    const uiLabel = dataInfo.configLabels["Modelling"];
    const [match, setMatch] = useState(0.5);
    const [errorMsg, setErrorMsg] = useState(null)

    useEffect(() => {
      getTableInfo()
    }, []);
    
    const getTableInfo = () => {
      setErrorMsg(null)

      const validatedFiles = fileStatus.filter(item => item.status === uiLabel["Validated"])

      const submitPath =  "/datamodelling/" + props.sessionID +'?user_email=' + `${props.userEmail}`+'&domain=' + `${props.domain}`+ '&fuzzy_score=' + `${match}` + '&intersection_score=' + `${match}` + '&file_names=' + `${validatedFiles.map((item) =>`"${item.fileName}"`).join(',')}`

      dataInfo.setLoading(true)
      API.GET(props.baseUrl, 
          submitPath,
          (response) => {
              dataInfo.setLoading(false)

              const rel = response.data.AI.relationships.map((item, idx) => ({
                ...item,
                color: getColor(idx),
              }));
              setRelation(rel);
              setResponse(response.data.AI.table_and_columns)

          },
          (error) => {
              dataInfo.setLoading(false)  
              setErrorMsg(uiLabel["ServiceFailed"])            
          }
      )
    }

    const getColor = (index) => {

      if (index < definedColor.length) {
        return definedColor[index]
      } else {
        const oldColor = definedColor[index - definedColor.length]
        return decreaseOpacity(oldColor, 70)
      }

    }
    const getERDiagram = (button, postData) => {
      setErrorMsg(null)
      const validatedFiles = fileStatus.filter(
        (item) => item.status === uiLabel["Validated"]
      );
  
      const submitPath =
        "/datamodelling/er_diagram/" +
        props.sessionID +
        "?user_email=" +
        `${props.userEmail}` +
        "&domain=" +
        `${props.domain}` +
        "&file_names=" +
        `${validatedFiles.map((item) => `"${item.fileName}"`).join(",")}`;
    
  
      dataInfo.setLoading(true);
  
      API.GET(props.baseUrl, 
        submitPath,
        (response) => {
          console.log("in data modelling er diagram success ", response);
          dataInfo.setLoading(false);
          setEr_url(response.data.AI.er_url)
  
        },
        (error) => {
          dataInfo.setLoading(false);
          setErrorMsg(uiLabel["ServiceFailed"])            
        }
      );
    };

    const postTableInfo = (button, postData) => {
      setErrorMsg(null)
      setSelectedColumns([])
      const validatedFiles = fileStatus.filter(
        (item) => item.status === uiLabel["Validated"]
      );
  
      const submitPath =
        "/datamodelling/" +
        props.sessionID +
        "?user_email=" +
        `${props.userEmail}` +
        "&domain=" +
        `${props.domain}` +
        "&fuzzy_score=" +
        `${match}` +
        "&intersection_score=" +
        `${match}` +
        "&file_names=" +
        `${validatedFiles.map((item) => `"${item.fileName}"`).join(",")}`;
      const data = {
        relation: button,
        file_names: validatedFiles.map((item) => item.fileName),
        domain: props.domain,
        button: button,
        ...(postData && { ...postData }),
      };
  
      dataInfo.setLoading(true);
  
      API.POST(
        props.baseUrl,
        submitPath,
        data,
        (response) => {
          dataInfo.setLoading(false);
  
          const rel = response.data.AI.relationships.map((item, idx) => ({
            ...item,
            color: getColor(idx),
          }));
          setRelation(rel);

          toast.info(response.data.AI.message, {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });

        },
        (error) => {
          dataInfo.setLoading(false);
          toast.warning(uiLabel["ServiceFailed"], {
            position: toast.POSITION.TOP_RIGHT,
            hideProgressBar: true,
            autoClose: 2000,
            closeButton: false
          });
        }
      );
    };
  
  
    const [response, setResponse] = useState([]);
  
    const [relation, setRelation] = useState([]);

    const [er_url, setEr_url] = useState("");

  
    const [selectedColumns, setSelectedColumns] = useState([]);

    const definedColor = [
      "#8F00FF",
      "#00AED4",
      "#694092",
      "#2A276A",
      "#EBCB48",
      "#2F6E92",
      "#DB7D2F",
      "#911C7A",
      "#000000",
      "#B292C6",
      "#9085AD",
      "#F4E28C",
      "#8BB6C7",
      "#ECBC88",
      "#C484BB",
      "#918F90",
      "#D74DEA",
      "#F4BB47",
      "#4EABD0",
      "#8C5BAC",
      "#594B85",
      "#EFD35D",
      "#5792AD",
      "#E39C52",
      "#A8499A",
      "#636466"
    ];
  
    const [selectedTab, setSelectedTab] = useState(0);
    const sasToken = getSasToken()
  
    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
      if (newValue === 1) {
        getERDiagram()
      }
    };
  
    const handleProgressChange = (event, newValue) => {
      setMatch(newValue);
    };

    const updateProgressChange = (event, newValue) => {
      getTableInfo();
    };
  
    const handleSave = () => {
      props.setSubFeature(kChart);
      toast.success(uiLabel["SavedSuccess"], {
        position: toast.POSITION.TOP_RIGHT,
        hideProgressBar: true,
        autoClose: 2000,
        closeButton: false
      });
    };
  
  
    const marks = [
      {
        value: 0,
        label: uiLabel["Exact"],
      },
      {
        value: 1,
        label: uiLabel["Loose"],
      },
    ];
  
    const changeHandler = (e) => {
      const val = e.target.value;
      setSelectedColumns((prev) =>
        prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
      );
    };
  
    const onAddHandler = () => {
      let tables = [];
      let related_columns = [];
      selectedColumns.forEach((i) => {
        const data = i.split("|");
        tables.push(data[0]);
        related_columns.push([data[1]]);
      });
      postTableInfo("ADD", {relation:{ tables, related_columns }});
    };

    const onRemoveHandler = () => {
      let table = "";
      let related_column = [];
      selectedColumns.forEach((i) => {
        const data = i.split("|");
        table = data[0];
        related_column = data[1];
      });
      postTableInfo("REMOVE", {relation:{ table, related_column }});
    };
  

    const getResultsView = () => {
      return (
        <div className={classes.insightsInputBox}>
          <Box
            sx={{
              m: "32px",
              ml: "300px",
              mr: "300px",
              display: "flex",
              gap: "15px",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: "5px",
                padding: "30px",
                background: "#F0E9F4",
                alignItems: "start",
                flexDirection: "column",
                height: "75px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  color: "#F0E9F4",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <img src={insightsBlueIcon} height={"25px"} color="#703E97" />
                <Typography
                  sx={{
                    color: "#703E97",
                    padding: "5px",
                    fontWeight: "700",
                    fontSize: "20px",
                    fontFamily: "Open Sans",
                  }}
                >
                 {uiLabel["DataModelling_Label"]}
                </Typography>
              </Box>
              <Typography sx={{color: "#474747", padding:'5px', fontWeight:"400", fontSize:"15px", fontFamily: "Open Sans"}}>
                    {uiLabel["DataModelling_Description"]}
                </Typography>
            </Box>
  
            {errorMsg &&
                <Alert severity="warning">
                  <AlertTitle>{uiLabel["Error"]}</AlertTitle>
                  {errorMsg}
                  </Alert>
            }

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                icon={<Divider />}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: "#8F00FF",
                  },
                }}
              >
                <Tab
                  label={uiLabel["EditRelation"]}
                  sx={{
                    color: "#8F00FFB2",
                    "&.Mui-selected": { color: "#8F00FF" },
                  }}
                />
                ,
                <Tab
                  label={uiLabel["ERDiagram"]}
                  sx={{
                    color: "#8F00FFB2",
                    "&.Mui-selected": { color: "#8F00FF" },
                  }}
                />
                ,
              </Tabs>
            </Box>
  
            <div role="tabpanel" hidden={selectedTab !== 0}>
              {selectedTab === 0 && (
                <Box>
                  {/* Action area */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      my: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        width: "30%",
                      }}
                    >
                      <Typography
                        sx={{ color: "#703E97", fontSize: "14px", width: "50%" }}
                      >
                       {uiLabel["AutoMatch"]}
                      </Typography>
                      <Slider
                        sx={{
                          color: "#703E97",
                        }}
                        value={match}
                        step={0.1}
                        onChange={handleProgressChange}
                        onChangeCommitted={updateProgressChange}
                        max={1}
                        min={0}
                        valueLabelDisplay="auto"
                        marks={marks}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-evenly",
                        color:"#703E97"
                      }}
                    >
                      {selectedColumns && (
                        <Typography>{selectedColumns.length} {uiLabel["Selected"]}</Typography>
                      )}
                      <Button
                        variant="contained"
                        sx={{
                          mx: 1,
                          backgroundColor: "#F1CB14",
                          color: "#2A276E",
                          "&:hover": { backgroundColor: "#eecb1f" },
                          "&.Mui-disabled": {
                            backgroundColor: "#F1CB14",
                          },
                          
                        }}
                        disabled = {selectedColumns.length != 1}
                        onClick={onRemoveHandler}
                      >
                        <img src={removeIcon} style={{width:"16px", height:"16px", paddingRight: '5px'}}/>
                        {uiLabel["Remove"]}
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          ml: 1,
                          backgroundColor: "#F1CB14",
                          color: "#2A276E",
                          "&:hover": { backgroundColor: "#eecb1f" },
                          "&.Mui-disabled": {
                            backgroundColor: "#F1CB14",
                          },
                        }}
                        disabled = {selectedColumns.length != 2}
                        onClick={onAddHandler}
                      >
                        <img src={addIcon} style={{width:"16px", height:"16px", paddingRight: '5px'}}/>
                        {uiLabel["AddNew"]}
                      </Button>
                    </Box>
                  </Box>
  
                  <Box
                    sx={{
                      border: "1px solid #9982AB",
                      borderRadius: "10px",
                      padding: "15px",
                      backgroundColor: "#9982ab1a",
                      overflowY: "scroll",
                      maxWidth: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      height: "400px",
                    }}
                  >
                    <Box sx={{ width: "49%" }}>
                      {response.map(
                        (item, idx) =>
                          idx % 2 === 0 && (
                            <TableView
                              key={idx}
                              item={item}
                              changeHandler={changeHandler}
                              selectedColumns={selectedColumns}
                            />
                          )
                      )}
                    </Box>
                    <Box sx={{ width: "49%" }}>
                      {response.map(
                        (item, idx) =>
                          idx % 2 === 1 && (
                            <TableView
                              key={idx}
                              item={item}
                              changeHandler={changeHandler}
                              selectedColumns={selectedColumns}
                            />
                          )
                      )}
                    </Box>
                  </Box>
  
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <Button variant="contained"
                      sx={{ color: "#F3F3F3", borderRadius: "2px", alignItems:'center', backgroundColor: "#703E97", "&:hover": { backgroundColor: "#703E97" },  "&.Mui-disabled": { backgroundColor: "#703E97", opacity:"0.7"} }}
                      onClick={handleSave}
                      disabled = {selectedColumns.length > 0 }
                    >
                      <Typography
                        sx={{
                          color: "#F3F3F3",
                          fontWeight: "400",
                          fontSize: "16px",
                          fontFamily: "Open Sans",
                          paddingX: "5px"
                        }}
                      >
                      {uiLabel["Done"]}
                      </Typography>
                    </Button>
                  </Box>
                </Box>
              )}
            </div>
  
            <div role="tabpanel" hidden={selectedTab !== 1}>
              {selectedTab === 1 && <Box> 
                
                { er_url.length > 0 ?
                  <img src={`${er_url}?${sasToken}`} className={classes.image}></img>
                  : uiLabel["ERPlaceHolder"]
                }
                 <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <Button variant="contained"
                      sx={{ color: "#F3F3F3", borderRadius: "2px", alignItems:'center', backgroundColor: "#703E97", "&:hover": { backgroundColor: "#703E97" },  "&.Mui-disabled": { backgroundColor: "#703E97", opacity:"0.7"} }}
                      onClick={() => handleDownload(`${er_url}?${sasToken}`)}
                    >
                      <img src={saveIcon} style={{width:"16px", height:"16px", paddingRight: '5px'}}/>
                      <Typography
                        sx={{
                          color: "#F3F3F3",
                          fontWeight: "400",
                          fontSize: "16px",
                          fontFamily: "Open Sans",
                          paddingX: "5px"
                        }}
                      >
                      {uiLabel["Download"]}
                      </Typography>
                    </Button>
                  </Box>
              </Box>}
            </div>
          </Box>
        </div>
      );
    };
  
    const TableView = ({ item, changeHandler, selectedColumns }) => {
      return (
        <Box
          sx={{
            mr: 1,
            mb: 1,
          }}
        >
          <Typography
            sx={{
              color: "#703E97",
              padding: "5px",
              fontWeight: "700",
              fontSize: "14px",
              fontFamily: "Open Sans",
            }}
          >
            {item?.table}
          </Typography>
          {item?.columns?.map((col) => {
            return (
              <TableColumnData
                col={col}
                table={item.table}
                relation={relation}
                selectedColumns={selectedColumns}
                changeHandler={changeHandler}
              />
            );
          })}
        </Box>
      );
    };
  
    return (
      <>
        {getResultsView()}
      </>
    );
  };
  
  const TableColumnData = ({
    table,
    col,
    relation,
    selectedColumns,
    changeHandler,
  }) => {
    const dataInfo = useContext(DataInsightsContext);
    const uiLabel = dataInfo.configLabels["Modelling"];
    const currentColumn =
      typeof col === "string"
        ? col
        : Object.keys(col).map((i) => `${i} (${col[i]})`);
    const columnName =
        typeof col === "string"
          ? col
          : Object.keys(col).map((i) => `${i}`);
    const checkBoxVal = `${table}|${columnName}`;
    const matchColor = relation.find(
      (rel) =>
        rel.tables.some((t) => t === table) &&
        rel.related_columns.includes(
          typeof col === "string"
            ? col.split(" ")[0]
            : Object.keys(col).map((i) => i)[0]
        )
    )?.color;
  
    const [isDisabled, setIsDisabled] = useState(false);
  
    useEffect(() => {
      setIsDisabled(
        (selectedColumns.some((v) => v.includes(table)) &&
          !selectedColumns.some((v) =>
            v.includes(`${table}|${columnName[0]}`)
          )) ||
          (selectedColumns.length > 1 &&
            !selectedColumns.some((v) => v.includes(`${table}|${columnName[0]}`)))
      );
    }, [selectedColumns, table, columnName, setIsDisabled]);

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          background: "#9982AB24",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2px",
        }}
      >
        <Typography
          sx={{
            color: "#474747",
            padding: "5px",
            fontWeight: "400",
            fontSize: "14px",
            fontFamily: "Open Sans",
          }}
        >
          {currentColumn}
        </Typography>
  
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {matchColor ? (
            <Typography
              sx={{
                color: "#FAFAFA",
                padding: "5px",
                width: "66px",
                height: "22px",
                borderRadius: "20px",
                background: matchColor,
                fontWeight: "400",
                fontSize: "14px",
                fontFamily: "Open Sans",
                textAlign: "center",
              }}
            >
              {uiLabel["Match"]}
            </Typography>
          ) : null}
          <FormControlLabel
            control={
              <Checkbox
              sx={{
                "&.MuiCheckbox-root": {
                  color: "#2A276E",
                },
                "&.Mui-disabled": {
                  color: "#918F90",
                },
              }}
              value={checkBoxVal}
              disabled={isDisabled}
              checked={selectedColumns.includes(checkBoxVal)}
              onChange={changeHandler}
            />
            }
            sx={{ margin: "0px" }}
          />
        </Box>
      </Box>
    );
  };
  
  export default DataModellingEditRelation;

  