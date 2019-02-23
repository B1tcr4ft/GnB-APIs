const fs = require('fs');

module.exports = function(app, db) {

    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    app.get('/api/', (req, res) => {
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    app.get('/api/retrieve/:id', (req, res) => {
        //prendi il file json della rete e restituiscilo
        filePath = './public/rete.json';
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
            }
            res.send(JSON.parse(data));
        });
    });

    app.post('/api/save/:id', (req, res) => {
        filePath = './public/rete.json';
        fs.writeFile(filePath, JSON.stringify(req.body), (err => {
            console.error(err);
        }));
        res.send('bayesian network has been saved');
    });

    app.use((req, res)=>{
        res.send('<h1>404 Page not Found</h1> <h2>ho capito che siam veloci ma dacci almeno il weekend</h2>');
    })

};