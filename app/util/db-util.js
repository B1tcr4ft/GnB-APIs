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
 * TODO this function is not returning anything back
 * Query data from specific database
 * @param httpUrl {string} url of the database
 * @param queryParams {string} query parameters
 */
function readFromDb(httpUrl, queryParams) {
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
 * Writes on db the updated values of the network's node states.
 * @param network {Network} reference to network object
 * @param updatedValues {JSON} JSON containing for each node of a network, the updated states' values.
 * @returns something
 * */
function writeNetworkStates(network, updatedValues) {
    //assemble httpUrl
    let httpUrl = network.DBWriteUrl;

    //compose queryParams
    let queryParams = `/write/db=${network.DBWriteName}&precision=s`;

    //scan updatedValues and compose dataToSend
    let dataToSend = "";
    updatedValues.nodes.forEach(node => {
       node.states.forEach(state => {
           dataToSend.concat(`${network.name},${node.id}_${state.name}=${state.value}\n`);
       })
    });
    console.log(dataToSend); //TODO remove this
    //call to writeOnDb
    writeOnDb(httpUrl, queryParams, dataToSend);
}

exports.writeOnDb = writeOnDb;
exports.readFromDb = readFromDb;
exports.writeNetworkStates = writeNetworkStates;