const { writeOnDb, readFromDb } = require('./db-util');

var exports = module.exports = {};

/**
 * Calculates and updates current node values and state
 * both in jsbayes and in the database
 * @param network {Network} the network to update
 */
function updateNetwork(network) {
    //update node states
    network.nodes.forEach(node => {
        if(node.hasSensor()) {
            let value = getSensorValue(node.sensor);
            let state = node.getState(value);

            network.graph.observe(node.id, state);
        }
    });
    network.graph.sample(20000);

    //query node states
    network.nodes.forEach(node => {
        console.log(network.graph.node(node.id).probs()); //TODO
        //writeNetworkStates(network, states);
    });
}

/**
 * Get the current value of the sensor
 * connected by the node
 * @param sensor {Sensor} the sensor
 * @returns {number} the value of the sensor latest registered
 */
function getSensorValue(sensor) {
    let httpUrl = sensor.DBSensorUrl;
    let queryParams = `/query?db=${sensor.DBSensorName}&q=SELECT ${sensor.DBSensorColumn} from ${sensor.DBSensorTable} ORDER BY time DESC LIMIT 1`;
    let values = readFromDb(httpUrl, queryParams);
    return values[0][1];
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

exports.updateNetwork = updateNetwork;