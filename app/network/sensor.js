var exports = module.exports = {};

exports.Sensor = class {
    /**
     * Build a sensor instance
     * @param DBSensorName {string} the database name
     * @param DBSensorTable
     * @param DBSensorColumn
     */
    constructor(DBSensorName, DBSensorTable, DBSensorColumn) {
        this.DBSensorName = DBSensorName;
        this.DBSensorTable = DBSensorTable;
        this.DBSensorColumn = DBSensorColumn;
    }

    /**
     * Get a sensor instance from a JSON containing
     * its definition
     * @param json {JSON} the json definition
     * @return {Sensor} the sensor instance
     */
    static fromJSON(json) {
        let DBSensorName = json.databaseSensorName;
        let DBSensorTable = json.databaseSensorTable;
        let DBSensorColumn = json.databaseSensorColumn;

        return new exports.Sensor(DBSensorName, DBSensorTable, DBSensorColumn);
    }
};