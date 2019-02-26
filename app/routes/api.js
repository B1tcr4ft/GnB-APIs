const { getNetworkFromJSON } = require('../util/json-util');
const fs = require('fs');
const request = require('request');

module.exports = function(app, db) {

    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    app.get('/api/', (req, res) => {
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    // Here I need to make calls to influx api directly to update measurements.
    app.post('/api/write-on-db/', (req, res) => {
        const statusCode = writeOnDb(req.body.httpUrl, req.body.dbPort, req.body.queryParams, req.body.dataToSend);
        res.send(statusCode);
    });

    app.get('/api/retrieve/:id', (req, res) => {
        let filePath = `./public/rete_${req.params.id}.json`;
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                res.send('<h1>file not found</h1>');
            } else {
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
                if(file !== '.gitkeep') {
                    var contents = fs.readFileSync(dirPath+file, 'utf8');
                    let data=JSON.parse(contents);
                    let bayesianObject={};
                    bayesianObject.id=data.id;
                    bayesianObject.name=data.name;
                    list.push(bayesianObject);
                    console.log(list);
                }
            });
            console.log(list);
            res.send(list);
        });
    });

    app.get('/api/start/:id', (req, res) => {
        let filePath = `./public/rete_${req.params.id}.json`;
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                res.send('<h1>file not found</h1>');
            } else {
                //stuff here
                let network = getNetworkFromJSON(JSON.parse(data));
                res.send('ok');
            }
        });
    });

    app.get('api/stop/:id', (req, res) => {
        //TODO
    });

    app.post('/api/config', (req, res) => {
        let data = JSON.stringify(req.body);
        let filePath = `./public/config.json`;
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                res.send(err);
            } else {
                res.send('configuration for databases updated');
            }
        })
    });

    app.post('/api/save/:id', (req, res) => {
        filePath = `./public/rete_${req.params.id}.json`;
        if (fs.existsSync(filePath)) {
            res.send('cannot overwrite existing network with same id');
        } else {
            req.body.id=req.params.id;
            let data = JSON.stringify(req.body);
            fs.writeFile(filePath, data, (err => {
                if (err) {
                    res.send(err);
                } else {
                    res.send('bayesian network has been saved');
                }
            }));
        }
    });

    app.get('/api/delete/:id', (req, res) => {
       //TODO
    });

    function writeOnDb(httpUrl,
                       queryParams,
                       data){
        request
            .post(`${httpUrl}${queryParams}`, {form:data})
            .on('response', (response) => {
                return response.statusCode;
            });

    }

    function readFromDb(httpUrl,
                        queryParams) {

    }

};