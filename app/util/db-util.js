const request = require('request');


var exports = module.exports = {};

/**
 * Insert data in a specific database
 * @param httpUrl {string} url of the database
 * @param queryParams {string} query parameters
 * @param data {string} query data
 */
function writeOnDb(httpUrl, queryParams, data){
    request
        .post(`${httpUrl}${queryParams}`, {form:data})
        .on('response', (res) => {
            return res.statusCode;
        });
}

/**
 * Query data from specific database
 * @param httpUrl {string} url of the database
 * @param queryParams {string} query parameters
 * @return {Array} array of values resulting from query
 */
function readFromDb(httpUrl, queryParams) {
    request
        .get(`${httpUrl}${queryParams}`)
        .on('error', function(err) {
            console.log(err)
        })
        .on('data', function(data) {
            let parsedData = JSON.parse(data).results[0].series[0].values;
            console.log(parsedData[0][1]);
            return parsedData;
        });
}

exports.writeOnDb = writeOnDb;
exports.readFromDb = readFromDb;
exports.writeNetworkStates = writeNetworkStates;