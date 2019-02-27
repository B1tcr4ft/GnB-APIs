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
            let value = getSensorValue(node);
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
 * TODO
 * Get the current value of the sensor
 * connected by the node
 * @param node {Node} the node connected to the sensor
 * @returns {number} the value of the sensor
 */
function getSensorValue(node) {
    //check node.sensor to see the database values
    return 0;
}

exports.updateNetwork = updateNetwork;