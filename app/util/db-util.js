const request = require('request');
const {Network} = require('gnb-network/node');

var exports = module.exports = {};

function writeOnDb(httpUrl,
                   queryParams,
                   data){
    request
        .post(`${httpUrl}${queryParams}`, {form:data})
        .on('response', (res) => {
            return res.statusCode;
        });

}
/**
 * Query data from specific database
 * */
function readFromDb(httpUrl,
                    queryParams) {
    request
        .get(`${httpUrl}${queryParams}`)
        .on('error', function(err) {
            console.log(err)
        })
        .on('data', function(data) {
            // decompressed data as it is received
            console.log(JSON.parse(data).results[0].series[0].values);
        });
}

/**
 * Writes on db the updated values of the network's state.
 * @param network {Network} reference to network obj
 * @param updatedValues {JSON} JSON containing for each node of a network, the updated states' values.
 * @returns something
 * */
function updateNetwork(network, updatedValues){
    //assemble httpUrl
    let httpUrl = '';
    //httpUrl +=

    //compose queryParams
    let queryParams = '';
    //scan updatedValues and compose dataToSend

    //call to writeOnDb
    //TODO scoprire come inviare punti multipli per la scrittura su influx
    writeOnDb(httpUrl, queryParams, data);
}

exports.writeOnDb = writeOnDb;
exports.updateNetwork = updateNetwork;