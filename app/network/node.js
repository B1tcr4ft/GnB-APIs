const { State } = require('./state');
const { Sensor } = require('./sensor');

var exports = module.exports = {};

exports.Node = class {
    /**
     * Build a node instance
     * @param id {string} the node id
     * @param name {string} the node name
     * @param parents {string[]} list of parent nodes' ID
     * @param states {State[]} list of states
     * @param cpt {array} list of cpts
     * @param sensor {Sensor} the sensor specs
     */
    constructor(id, name, parents, states, cpt, sensor) {
        this.id = id;
        this.name = name;
        this.parents = parents;
        this.states = states;
        this.cpt = cpt;
        this.sensor = sensor;
    }

    /**
     * Get a node instance from a JSON containing
     * its definition
     * @param json {JSON} the json definition
     * @return {Node} the node instance
     */
    static fromJSON(json) {
        let id = json.id;
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

        return new exports.Node(id, name, parents, states, cpt, sensor);
    }
};