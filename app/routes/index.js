const routes = require('./routes');
const update = require('./update'); // TODO remove this before release

module.exports = function(app, db) {
    routes(app, db);
    update(app, db);

    app.use((req, res)=>{
        res.send('<h1>404 Page not Found</h1> <h2>ho capito che siam veloci ma dacci almeno il weekend</h2>');
    });
    // Other route groups could go here, in the future
};