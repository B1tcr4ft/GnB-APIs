const request = require('request');
const {Network} = require('gnb-network/node');

let exports = module.exports = {};

/**
 * TODO complete documentation
 * @param httpUrl {string} url of the database
 * @param queryParams {string} query parameters
 * @param data
 */
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
 * @param httpUrl {string} url of the database
 * @param queryParams {string} query parameters
 */
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
function updateNetwork(network, updatedValues) {
    //assemble httpUrl
    let httpUrl = newtwork.DBWriteUrl;

    //compose queryParams
    let queryParams = `/write/db=${newtwork.DBWriteName}&precision=s`;

    //scan updatedValues and compose dataToSend
    let dataToSend = "";
    for (let node in updatedValues) {
        for (let node_state in node.states) {
            dataToSend.concat(`${network.name},${node.id}_${node_state.name}=${node_state.value}\n`);
        }
    }
    console.log(dataToSend);
    //call to writeOnDb
    writeOnDb(httpUrl, queryParams, dataToSend);
}

exports.writeOnDb = writeOnDb;
exports.readFromDb = readFromDb;
exports.updateNetwork = updateNetwork;