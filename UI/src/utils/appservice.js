import API from "./api.service";

let APPSERVICE = {};

let appConfigData = {};

APPSERVICE.LOADDATA = function (data, callback) {
    appConfigData = data;
    if (callback) callback();
}

function run(key, callback) {
    setTimeout(function () {
        if (callback) {
            callback(appConfigData[key]);
        }
    }, 1);
}

APPSERVICE.GET = (key, success, error) => {
    try {
        run(key, success)
    }
    catch (err) {
        if (error) error(err);
    };
}

export default APPSERVICE;