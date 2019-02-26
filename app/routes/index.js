const routes = require('./routes');
const update = require('./update'); // TODO remove this before release

module.exports = function(app, db) {
    routes(app, db);
    update(app, db);
    // Other route groups could go here, in the future
};