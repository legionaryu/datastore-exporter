"use strict";

var moment = require("moment-timezone");
var path = require("path");
var fs = require("fs");
var logFileNameFormat = "YYYYMMDD[.log]";

/*
 * Exports the data from data_array to datastore format using the hierarchy and datetime to determine the file that will be written
 *
 * @param {string} hierarnchy - sets the folder structure that will be created, must be a path like "flowers/species/color"
 * @param {string} datetime - sets the datetime, shoud be a Date, Momentjs or a String date
 * @param {string} tagname - sets the name that will be used as the entry tag
 * @param {array} data_array - sets the data that will be written on file, it will be converted to Number before its written
 * @param {string} str_commentary - sets the commentary of the data written in the format "color r:%f g:%f b:%f" it accepts %d and %f only
 * 
 * @returns {string} - the same string written to the file
 */
exports.writeToDatastoreLog = function (hierarchy, datetime, tagname, data_array, str_commentary) {
    if(datetime && tagname && data_array) {
        var unix_ms = 0;
        if(datetime instanceof moment) {
            unix_ms = datetime.valueOf();
        }
        else if(datetime instanceof Date) {
            datetime = new moment(datetime);
            unix_ms = datetime.valueOf();
        }
        else {
            datetime = new moment.tz(new Date(datetime));
            unix_ms = datetime.valueOf();
        }
        var dir = path.normalize(hierarchy);
        makeDir(dir);
        var data_str = [];
        data_array.forEach(function(item){
            // var n = 0;
            // data_str.push(typeof(item)==="number"?item:((n=parseFloat(item))?n:0));
            data_str.push(Number(item)||0);
        });
        var dataLog = `${unix_ms}, 2, ${data_array.length}, LOG, ${tagname}, ${data_str.join()}, ${str_commentary} \r\n`;
        fs.appendFileSync(path.join(hierarchy, datetime.clone().utc().format(logFileNameFormat)), dataLog);
        return dataLog;
    } else {
        throw new Error("The parameter " + (datetime ? (tagname ? "data_array" : "tagname") : "datetime") + " is missing");
    }
};

function makeDir(str_path) {
    try {
        fs.mkdirSync(str_path);
    } catch(ex) {
        // console.log(JSON.stringify(ex));
        if(ex.code !== "EEXIST") {
            if(ex.code === "ENOENT") {
                var dirPathSplit = str_path.split(path.sep);
                var dirPath = "";
                dirPathSplit.forEach(function (value) {
                    dirPath = path.join(dirPath, value);
                    makeDir(dirPath);
                });
            } else {
                // console.log(JSON.stringify(ex));
                throw ex;
            }
        }
    }
}