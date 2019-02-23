const fs = require('fs');

module.exports = function(app, db) {

    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    app.get('/api/', (req, res) => {
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    app.post('/api/save', (req, res) => {
        filePath = './public/rete.json';
        fs.writeFileSync(filePath, JSON.stringify(req.body));
        res.send('bayesian network has been saved');
    });

    app.use((req, res)=>{
        res.send('<h1>404 Page not Found</h1> <h2>ho capito che siam veloci ma dacci almeno il weekend</h2>');
    })

};