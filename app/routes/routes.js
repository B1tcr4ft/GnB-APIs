const fs = require('fs');
//const jsonUtils = require('./gnb');
const jsbayes = require('jsbayes');

module.exports = function(app, db) {



    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    app.get('/api/write-on-db', (req, res) => {

    });

    app.get('/api/', (req, res) => {
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    app.get('/api/retrieve/:id', (req, res) => {
        filePath = `./public/rete_${req.params.id}.json`;
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                res.send('<h1>file not found</h1>');
            }else {
                res.send(JSON.parse(data));
            }
        });
    });

    app.post('/api/retrieve/all', (req, res) => {
        var path = require('path');
        var dirPath = "public/";
        let list=[];
        fs.readdir(dirPath, function (err, files) {
            if (err) {
                return console.log('Unable to scan dir ' + err);
            }
            files.forEach(function (file) {
                    var contents = fs.readFileSync(dirPath+file, 'utf8');
                    let data=JSON.parse(contents);
                    let bayesianObject={};
                    bayesianObject.id=data.id;
                    bayesianObject.name=data.name;
                    list.push(bayesianObject);
                    console.log(list);

            });
            console.log(list);
            res.send(list);
        });

    });

    app.post('/api/save/:id', (req, res) => {
        filePath = `./public/rete_${req.params.id}.json`;
        if (fs.existsSync(filePath)) {
            res.send('cannot overwrite existing network with same id');
        }else {
            req.body.id=req.params.id;
            let data = JSON.stringify(req.body);
            fs.writeFile(filePath, data, (err => {
                if (err) {
                    res.send(err);
                } else {
                    //rete = getGraphFromJSON(data);
                    res.send('bayesian network has been saved');
                }
            }));
        }
    });

    app.use((req, res)=>{
        res.send('<h1>404 Page not Found</h1> <h2>ho capito che siam veloci ma dacci almeno il weekend</h2>');
    })

};