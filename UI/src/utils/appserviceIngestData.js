
let APPSERVICEINGESTDATA = {};

const appConfig = require("@azure/app-configuration");
//CONNECTION STRING
const client = new appConfig.AppConfigurationClient("Endpoint=https://emtech-appconfig-all-all-poc.azconfig.io;Id=PXY1;Secret=d6B5ayi7EvNYs78RhVyewKBhzhp9uiXvhf6ip5CFbpY=");

let appConfigData = {};

const useCase = 'SCC';
const domain = 'GENERAL';

APPSERVICEINGESTDATA.LOADDATA = async function () {
    const sampleKeys = client.listConfigurationSettings({
        keyFilter: "UI_" + useCase + "*",
    });

    for await (const setting of sampleKeys) {
        appConfigData[setting.key] = setting.value;
    }

    console.log(JSON.stringify(appConfigData));
}

APPSERVICEINGESTDATA.FOR_USECASE = () => {
    let useCaseData = {
        ["UI_" + useCase + "_BASE_URL"]: "https://emtech-wabackend-scc-poc.azurewebsites.net/",
        ["UI_" + useCase + "_CHAT_LABEL"]: "Supervised Content Creation",
        ["UI_" + useCase + "_CHAT_LONG_DESCRIPTION"]: "The Supervised Content Creation AI will create content based on user prompts and known content repositories and allow the user to interact to refine the content. The AI can be used to produce both templated output as well as untemplated output.  The AI is intended to provide users with a quick start to producing usable draft content on a subject or topic of their choice.  This allows the user to spend more time on formulating their ideas and less on typing and drafting content",
        ["UI_" + useCase + "_CHAT_SHORT_DESCRIPTION"]: "The Supervised Content Creation AI will create content based on user prompts and known content repositories",
        ["UI_" + useCase + "_SHOULD_UPLOAD"]: "false",
        ["UI_" + useCase + "_SHOW_DOC_REFERENCE"]: "false",
        ["UI_" + useCase + "_CONTACT_EMAIL_LINK"]: "mailto:John.halulko@viatris.com",
        ["UI_" + useCase + "_CONTACT_EMAIL_TEXT"]: "John.halulko@viatris.com",
        ["UI_" + useCase + "_CONTACT_NAME"]: "John Halulko",
    }
    console.log('useCaseData', useCaseData)
    return useCaseData;
}

APPSERVICEINGESTDATA.FOR_USECASE_DOMAIN = () => {
    let useCaseDomainData = {
        ["UI_" + useCase + "_" + domain + "_ALIAS_NAME"]: "GENERAL",
        ["UI_" + useCase + "_" + domain + "_CONTACT_EMAIL_LINK"]: "mailto:Ryan.Meyer@viatris.com",
        ["UI_" + useCase + "_" + domain + "_CONTACT_EMAIL_TEXT"]: "Ryan.Meyer@viatris.com",
        ["UI_" + useCase + "_" + domain + "_CONTACT_NAME"]: "Ryan Meyer",
        ["UI_" + useCase + "_" + domain + "_PROMPT"]: "",
    }
    console.log('useCaseDomainData', useCaseDomainData)
    return useCaseDomainData;
}


APPSERVICEINGESTDATA.INGEST = () => {
    for (const [key, value] of Object.entries(APPSERVICEINGESTDATA.FOR_USECASE())) {
        client.setConfigurationSetting({
            key: key,
            value: value,
            label: "poc",
        });
    }

    for (const [key, value] of Object.entries(APPSERVICEINGESTDATA.FOR_USECASE_DOMAIN())) {
        client.setConfigurationSetting({
            key: key,
            value: value,
            label: "poc",
        });
    }

    APPSERVICEINGESTDATA.LOADDATA();
}

APPSERVICEINGESTDATA.CONFIRM = () => {
    let text = "Update for USECASE=" + useCase + " DOMAIN=" + domain;
    if (window.confirm(text) == true) {
        alert("Ingestion started. Check console");
        APPSERVICEINGESTDATA.INGEST();
    } else {
        alert('Better luck next time!');
    }
}

APPSERVICEINGESTDATA.CONFIRM();
//

export default APPSERVICEINGESTDATA;