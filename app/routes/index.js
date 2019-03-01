const api = require('./api');
const update = require('./update'); // TODO remove this before release

module.exports = app => {
    app.get('/', (req, res) => res.redirect('/api/'));

    api(app);
    update(app);
    // Other route groups could go here, in the future

    app.use((req, res) => {
        res.send('<h1>404 Page not Found</h1>');
    });
};