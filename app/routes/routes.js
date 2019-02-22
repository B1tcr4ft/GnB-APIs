module.exports = function(app, db) {

    app.post('/api/create', (req, res) => {
        // You'll create your note here.
        res.send('bayesian network created')
    });

};