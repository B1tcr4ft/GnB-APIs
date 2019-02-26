require('./node');
require('../util/json-util');
const jsbayes = require('jsbayes');

class Network {
    /**
     * Build a network instance
     * @param id {string} the network id
     * @param name {string} the network name
     * @param DBWriteName {string} the database name (as it is called on Grafana's database list) where the nodes' probabilities will be registered
     * @param refreshTime {number} the interval time (in milliseconds) between the node updates
     * @param nodes {Node[]} the list of nodes
     */
    constructor(id, name, DBWriteName, refreshTime, nodes) {
        this.id = id;
        this.name = name;
        this.DBWriteName = DBWriteName;
        this.refreshTime = refreshTime;
        this.nodes = nodes;

        this.makeGraph();
    }

    /**
     * TODO
     * I'd like to make this function private but idk how to make it
     */
    makeGraph() {
        if(this.graph != null) {
            return;
        }

        let graph = jsbayes.newGraph();

        //creating the nodes
        this.nodes.forEach(node => {
            let states = node.states.map(state => state.name);
            graph.addNode(node.ID, states);
        });

        //adding data to nodes
        this.nodes.forEach(node => {
            let graphNode = graph.node(node.ID);

            //setting parent nodes
            node.parents.forEach(parent => graphNode.addParent(graph.node(parent)));

            //setting cpt
            graphNode.setCpt(node.cpt);
        });

        graph.sample(20000);

        this.graph = graph;
    }

    /**
     * TODO
     * Calculates and updates current node values and state
     * both in jsbayes and in the database
     */
    update() {

    }

    /**
     * Get a JSON definition of the network instance
     * @returns {JSON} the JSON definition
     */
    toJSON() {
        return getJSONFromNetwork(this);
    }

    /**
     * Get a network instance from a JSON containing
     * its definition
     * @param json {JSON} the json file
     * @returns {Network} the network instance
     */
    static fromJSON(json) {
        return getNetworkFromJSON(json);
    }
}