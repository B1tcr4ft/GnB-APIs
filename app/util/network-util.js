const {writeOnDb, readFromDb} = require('./db-util');

var exports = module.exports = {};

/**
 * Calculates and updates current node values and state
 * both in jsbayes and in the database
 * @param network {Network} the network to update
 */
function updateNetwork(network) {
    let promises = [];
    network.nodes.forEach(node => {
        if (node.hasSensor()) {
            let p = getSensorValue(node.sensor).then(data => {
                let state = node.getState(data);
                network.graph.observe(node.id, state);
            }, error => {
                console.log(error); //TODO handle error state
            });

            promises.push(p);
        }
    });

    Promise.all(promises).then(() => {
        network.graph.sample(20000).then(() => {
            //query node states
            let dataToWrite = {};
            dataToWrite.nodes = [];
            network.nodes.forEach(node => {
                let objNode = {};
                objNode.id = node.id;
                objNode.states = [];

                for (let i = 0; i < node.states.length; i++) {
                    let state = {};
                    state.name = node.states[i].name;
                    state.value = network.graph.node(node.id).probs()[i];
                    objNode.states.push(state);
                }

                dataToWrite.nodes.push(objNode);
            });

            writeNetworkStates(network, JSON.parse(JSON.stringify(dataToWrite)));
        });
    }, () => {
        //TODO handle error state
    });
}

/**
 * Get the current value of the sensor
 * connected by the node
 * @param sensor {Sensor} the sensor
 * @returns {Promise} the value of the sensor latest registered
 */
function getSensorValue(sensor) {
    return new Promise((resolve, reject) => {
        let httpUrl = sensor.databaseSensorUrl;
        let queryParams = `/query?u=${sensor.databaseSensorUser}&p=${sensor.databaseSensorPassword}&db=${sensor.databaseSensorName}&q=SELECT ${sensor.databaseSensorColumn} FROM ${sensor.databaseSensorTable} ORDER BY time DESC LIMIT 1`;

        readFromDb(httpUrl, queryParams).then(data => {
            resolve(data[0][1]);
        }, error => {
            reject(error);
        });
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
    let httpUrl = network.databaseWriteUrl;

    //compose queryParams
    let queryParams = `/write?u=${network.databaseWriteUser}&p=${network.databaseWritePassword}&db=${network.databaseWriteName}&precision=s`;

    //scan updatedValues and compose dataToSend
    let dataToSend = "";
    updatedValues.nodes.forEach(node => {
        node.states.forEach(state => {
            dataToSend += `${network.id} ${node.id}_${state.name.replace(' ', '\\ ')}=${state.value}\n`;
        });
    });

    //call to writeOnDb
    writeOnDb(httpUrl, queryParams, dataToSend);
}

exports.updateNetwork = updateNetwork;