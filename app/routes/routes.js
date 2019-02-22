module.exports = function(app, db) {

    app.get('api/', (req, res)=>{
        res.redirect('/api/');
    });

    app.get('/api/', (req, res)=>{
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    app.post('/api/create', (req, res) => {
        // You'll create your note here.
        res.send('bayesian network created')
    });

    app.use((req, res)=>{
        res.send('<h1>404 Page not Found</h1> <h2>ho capito che siam veloci ma dacci almeno il weekend</h2>');
    })

};