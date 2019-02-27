/**
 * TODO
 * Calculates and updates current node values and state
 * both in jsbayes and in the database
 * @param network {Network} the network to update
 */
function updateNetwork(network) {
    //update node states
    network.nodes.forEach(node => {
        if(node.hasSensor()) {
            let value = 0; //todo fix this
            network.graph.node(node.id).observe(node.updateState(value));
        }
    });

    network.graph.sample(20000);
}

exports.updateNetwork = updateNetwork;