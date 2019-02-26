var exports = module.exports = {};

exports.State = class {
    constructor(name, trigger) {
        this.name = name;
        this.trigger = trigger;
    }

    /**
     * TODO
     * Check whether the trigger has been fired or not
     * @param currentValue {number} the current node value to check
     * @return {boolean} true, if the trigger is fired, false otherwise
     */
    isFired(currentValue) {
        return false;
    }

    /**
     * Get a state instance from a JSON containing
     * its definition
     * @param json {JSON} the json definition
     * @return {State} the state instance
     */
    static fromJSON(json) {
        let name = json.name;
        let trigger = json.trigger;

        return new exports.State(name, trigger);
    }
};