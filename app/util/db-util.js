const request = require('request');


var exports = module.exports = {};

/**
 * Insert data in a specific database
 * @param httpUrl {string} url of the database
 * @param queryParams {string} query parameters
 * @param data {string} query data
 * @returns {string} status code
 */
function writeOnDb(httpUrl, queryParams, data) {
    return new Promise((resolve, reject) => {
        request
            .post(`${httpUrl}${queryParams}`, {form: data})
            .on('error', error => {
                reject(error);
            })
            .on('response', response => {
                resolve(response.statusCode);
            });
    });
}

/**
 * Query data from specific database
 * @param httpUrl {string} url of the database
 * @param queryParams {string} query parameters
 * @return {Promise} array of values resulting from query
 */
function readFromDb(httpUrl, queryParams) {
    return new Promise((resolve, reject) => {
        request
            .get(`${httpUrl}${queryParams}`)
            .on('error', error => {
                reject(error);
            })
            .on('data', data => {
                resolve(JSON.parse(data).results[0].series[0].values);
            });
    });
}

exports.writeOnDb = writeOnDb;
exports.readFromDb = readFromDb;