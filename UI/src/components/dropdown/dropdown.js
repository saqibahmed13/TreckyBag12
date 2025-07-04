import React from "react";
import Select from "react-dropdown-select";
import {
    Switch,
    Typography,
    Box,
    FormGroup,
    styled,
    Autocomplete,
    TextField,
    Checkbox,
    Chip
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import './dropdown.css';

const VoiceChatToggle = styled(Switch)(({ theme }) => ({
    width: 80,
    height: 36,
    padding: 8,
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(44px)',
            fontSize: 12,
            fontWeight: '700',
            '& .MuiSwitch-thumb:before': {
                content: '"Chat"',
            },
            '& + .MuiSwitch-track': {
                backgroundColor: '#efe160',
                opacity: 1,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: '#fff',
        width: 35,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:before': {
            content: '"Voice"',
            fontSize: 12,
            color: '#1976d2',
            fontWeight: '700',
        },
    },
    '& .MuiSwitch-track': {
        borderRadius: 20,
        backgroundColor: '#d401f9',
        opacity: 1,
        transition: theme.transitions.create(['background-color']),
    },
}));

function Dropdown(props) {
    const [domain, setDomain] = React.useState(props.domain);
    const [domainList, setDomainList] = React.useState([]);
    const [metaTagList, setMetaTagList] = React.useState([]);
    const [isMetaTagAvailable, setIsMetaTagAvailable] = React.useState(false);
    const [tagName, setTagName] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState([]);
    const [allSelected, setAllSelected] = React.useState(false);
    const [isSupportVoice, setIsSupportVoice] = React.useState(true);

    React.useEffect(() => {
        let domains = [];
        props.domainlist.map((value, index) => {
            domains.push({
                value: value,
                label: props.domainAllias[value] ? props.domainAllias[value] : value
            });
        });
        domains.sort((a, b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
        setDomainList(domains);
        if (Array.isArray(props.metaTagList?.tag_values) &&
            props.metaTagList.tag_values.length > 0 &&
            props.metaTagList.tag_name !== 'None') {
            let metatags = props.metaTagList.tag_values.map((value) => ({
                title: value
            }));
            metatags.sort((a, b) => a.title.localeCompare(b.title));
            metatags.push({ title: "None" });
            let _tagDisplayName = props ? props.metaTagList.tag_name : "";
            setTagName(_tagDisplayName);
            setIsMetaTagAvailable(true);
            setMetaTagList(metatags);
        } else {
            let _tagDisplayName = 'None';
            setTagName(_tagDisplayName);
        }
    }, []);

    React.useEffect(() => {
        if (props.resetMetaTags) {
            setSelectedTags([]);
            setAllSelected(false);
            props.handleResetMetaTag();
        }
    }, [props]);

    const setValues = (values) => {
        if (typeof values[0].value != "undefined") { props.setURIDomain(values[0].value); }
    }

    const handleChange = (event, newValue) => {
        const hasSelectAll = newValue.some((tag) => tag.title === "Select All");
        const hasNone = newValue.some((tag) => tag.title === "None");
        if (hasNone) {
            setSelectedTags([{ title: "None" }]);
            setAllSelected(false);
            props.handleSelectedTagValues([]);
            return;
        }

        if (hasSelectAll) {
            const allOptions = metaTagList.filter((tag) => tag.title !== "None" && tag.title !== "Select All");
            setSelectedTags(allOptions);
            setAllSelected(true);
            props.handleSelectedTagValues(allOptions.map(tag => tag.title));
            return;
        }
        const filteredSelection = newValue.filter((tag) => tag.title !== "Select All");
        setSelectedTags(filteredSelection);
        setAllSelected(filteredSelection.length === metaTagList.length - 1);
        props.handleSelectedTagValues(filteredSelection.map(tag => tag.title));
    };

    const handleOptionClick = (event, option) => {
        event.stopPropagation();
        if (option.title === "None") {
            if (selectedTags.some(tag => tag.title === "None")) {
                setSelectedTags([]);
                props.handleSelectedTagValues([]);
            } else {
                setSelectedTags([{ title: "None" }]);
                setAllSelected(false);
                props.handleSelectedTagValues([]);
            }
            return;
        }
        if (option.title === "Select All") {
            if (allSelected) {
                setSelectedTags([]);
                setAllSelected(false);
                props.handleSelectedTagValues([]);
            } else {
                const allOptions = metaTagList.filter(tag => tag.title !== "None" && tag.title !== "Select All");
                setSelectedTags(allOptions);
                setAllSelected(true);
                props.handleSelectedTagValues(allOptions.map(tag => tag.title));
            }
            return;
        }
        let newSelected = selectedTags.some(tag => tag.title === option.title)
            ? selectedTags.filter(tag => tag.title !== option.title)
            : [...selectedTags, option];
        setSelectedTags(newSelected);
        setAllSelected(newSelected.length === metaTagList.length - 1);
        props.handleSelectedTagValues(newSelected.map(tag => tag.title));
    };

    const displayValue = () => {
        if (selectedTags.length === 0) return [];
        if (selectedTags.some(tag => tag.title === "None")) return [{ title: "None" }];
        if (allSelected) return [{ title: "Select All" }];
        if (selectedTags.length === 1) return selectedTags;
        return [{ title: `${selectedTags[0].title} + ${selectedTags.length - 1}` }];
    };


    const handleChangeForSupportBot = async (event) => {
        const selectItem = event.target.checked;
        setIsSupportVoice(selectItem);
        props.handleSupportBot(selectItem);
    }


    return (
        <div className="domain-drop-down">
            {
                domain && props.domainAllias ? <Select options={domainList} onChange={(values) => setValues(values)} values={[{ label: props.domainAllias[domain] }]} dropdownHandle={(domainList.length > 1)} disabled={(domainList.length < 2)} className="domainTagSelection" /> : <></>
            }
            {
                (domain == 'general' && props.useCaseChatBot == 'supportbot') ?
                    <FormGroup>
                        <Box display="flex" alignItems="center" gap={1}>
                            <VoiceChatToggle
                                checked={isSupportVoice}
                                onChange={handleChangeForSupportBot}
                                name="supportbot"
                            />
                            <Box display="flex" alignItems="center" gap={1}>
                                {isSupportVoice ? (
                                    <ChatIcon style={{ color: '#efe160' }} />
                                ) : (
                                    <KeyboardVoiceIcon style={{ color: '#d401f9' }} />
                                )}
                                <Typography variant="body1">
                                    {isSupportVoice
                                        ? 'Viatris Chat Assistant for IT Support'
                                        : 'Viatris Voice Assistant for IT Support'}
                                </Typography>
                            </Box>
                        </Box>
                    </FormGroup>
                    : <></>
            }
            {
                domain && isMetaTagAvailable ?
                    <Autocomplete
                        multiple
                        options={metaTagList.length > 1 ? [{ title: "Select All" }, ...metaTagList] : metaTagList}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.title}
                        value={displayValue()}
                        onChange={handleChange}
                        className="autoAlignmentStyle"
                        isOptionEqualToValue={(option, value) => option.title === value.title}
                        isOptionDisabled={(option) =>
                            selectedTags.some((tag) => tag.title === "None") && option.title !== "None"
                        }
                        renderOption={(props, option) => {
                            const isSelected = selectedTags.some((tag) => tag.title === option.title);
                            const isDisabled = selectedTags.some((tag) => tag.title === "None") && option.title !== "None";

                            return (
                                <li
                                    {...props}
                                    style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        opacity: isDisabled ? 0.5 : 1,
                                        pointerEvents: isDisabled ? "none" : "auto",
                                    }}
                                    onClick={(event) => handleOptionClick(event, option)}
                                >
                                    <Checkbox checked={isSelected || (option.title === "Select All" && allSelected)} />
                                    <span style={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {option.title}
                                    </span>
                                </li>
                            );
                        }}
                        sx={{
                            width: 400,
                            "& .MuiInputBase-root": {
                                maxHeight: "100px",
                                overflowY: "auto",
                                display: "flex",
                                flexWrap: "wrap",
                                boxSizing: "border-box",
                            },
                            "& .MuiChip-root": {
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            },
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={`Select ${tagName}`}
                                sx={{
                                    "& .MuiInputBase-input::placeholder": {
                                        color: "#2A276E",
                                    },
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    style: {
                                        display: "flex",
                                        flexWrap: "wrap",
                                        overflowY: "auto",
                                        maxHeight: "200px",
                                        boxSizing: "border-box",
                                    },
                                }}
                            />
                        )}
                        renderTags={(selected, getTagProps) => {
                            return (
                                <>
                                    {selected.map((tag, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={tag.title}
                                            label={tag.title}
                                            sx={{
                                                maxWidth: "250px", // Adjust width as needed
                                                width: "250px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        />
                                    ))}
                                    {selected.length > 1 && (
                                        <span style={{ marginLeft: '28px', fontWeight: 'bold' }}>
                                            + {selected.length - 1}
                                        </span>
                                    )}
                                </>
                            );
                        }}
                    />
                    : <></>
            }

        </div>
    );
}

export default Dropdown;
