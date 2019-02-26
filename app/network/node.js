require('./state');
require('./sensor');

class Node {
    /**
     * Build a node instance
     * @param ID {string} the node ID
     * @param name {string} the node name
     * @param parents {string[]} list of parent nodes' ID
     * @param states {State[]} list of states
     * @param cpt {array} list of cpts
     * @param sensor {Sensor} the sensor specs
     */
    constructor(ID, name, parents, states, cpt, sensor) {
        this.ID = ID;
        this.name = name;
        this.parents = parents;
        this.states = states;
        this.cpt = cpt;
        this.sensor = sensor;
    }

    /**
     * TODO check if it works
     * Get a node instance from a JSON containing
     * its definition
     * @param json {JSON} the json definition
     * @return {Node} the node instance
     */
    static fromJSON(json) {
        let ID = json.ID;
        let name = json.name;
        let parents = json.parents;
        let states = json.states.map(state => State.fromJSON(state));

        let cpt = [];
        if(json.cpt.length === 1) {
            cpt = json.cpt[0].map(num => parseFloat(num));
        } else {
            json.cpt.forEach(entry => cpt.push(entry.map(num => parseFloat(num))));
        }

        let sensor = Sensor.fromJSON(json.sensor);

        return new Node(ID, name, parents, states, cpt, sensor);
    }
}