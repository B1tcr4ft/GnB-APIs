const { writeNetworkStates, readFromDb } = require('./db-util');

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
    let states = {};
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

exports.updateNetwork = updateNetwork;