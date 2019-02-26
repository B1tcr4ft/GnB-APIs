import { Network } from '../network';
import * as jsbayes from 'jsbayes'

/**
 * @deprecated
 * Construct a jsbayes graph over a JSON containing
 * its definition
 * @param json {JSON} the json file
 * @returns {jsbayes} the jsbayes graph
 */
function getGraphFromJSON(json) {
    let graph = jsbayes.newGraph();

    //creating the nodes
    json.nodes.map(node => {
       let status = node.states.map(state => state.name);
       graph.addNode(node.id, status);
    });

    //adding data to nodes
    json.nodes.map(node => {
        let graphNode = graph.node(node.id);

        //setting parents
        node.parents.forEach(parent => graphNode.addParent(graph.node(parent)));

        //setting cpt
        let cpt = [];
        if(node.cpt.length === 1) {
            cpt = node.cpt[0].map(num => parseFloat(num));
        } else {
            node.cpt.map(entry => cpt.push(entry.map(num => parseFloat(num))));
        }

        graphNode.setCpt(cpt);
    });

    graph.sample(20000);

    return graph;
}

/**
 * TODO
 * Get a JSON definition of a network instance
 * @param network {Network} the network instance
 * @returns {JSON} the JSON definition
 */
export function getJSONFromNetwork(network) {
    return null;
}

/**
 * Get a network instance from a JSON containing
 * its definition
 * @param json {JSON} the json file
 * @returns {Network} the network instance
 */
export function getNetworkFromJSON(json) {
    let id = json.id;
    let name = json.name;
    let DBWriteName = json.databaseWriteName;
    let refreshTime = json.refreshTime;
    let nodes = json.nodes.map(node => Node.fromJSON(node));

    return new Network(id, name, DBWriteName, refreshTime, nodes);
}