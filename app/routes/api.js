const { Network } = require('gnb-network/node');
const { updateNetwork } = require('../util/network-util');
const { readFromDb, writeOnDb } = require('../util/db-util');
const fs = require('fs');
const uid = require('uid-safe');


let clockListID = [];
let activeNetworksList = [];

module.exports = function(app) {

    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    app.get('/api/', (req, res) => {
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    app.get('/api/delete/:id', (req, res) => {
        let filePath = `./public/network_${req.params.id}.json`;
        if (!fs.existsSync(filePath)) {
            res.send('network with this id does not exist');
        } else {
            fs.unlink(filePath, err => {
                if(err) throw err;
                res.send('bayesian network has been deleted!');
            })
        }
    });

    app.get('/api/retrieve/:id', (req, res) => {
        let filePath = `./public/network_${req.params.id}.json`;
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                res.send('<h1>file not found</h1>');
            } else {
                res.send(JSON.parse(data));
            }
        });
    });

    app.get('/api/start/:id', (req, res) => {
        if(clockListID[req.params.id]) {
            res.send('process already started for this network');
        } else {
            let filePath = `./public/network_${req.params.id}.json`;
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.send('file not found');
                } else {
                    let network = Network.fromJSON(JSON.parse(data));
                    activeNetworksList[network.id] = network;
                    clockListID[req.params.id] = setInterval(function () {
                        updateNetwork(network);
                    }, network.refreshTime);

                    res.send('ok');
                }
            });
        }
    });

    app.get('/api/stop/:id', (req, res) => {
        if(clockListID[req.params.id]) {
            clearInterval(clockListID[req.params.id]);
            clockListID.splice(req.params.id, 1);
            activeNetworksList.splice(req.params.id, 1);
            res.send('ok');
        } else {
            res.send('no processes running for this network');
        }
    });

    // Here I need to make calls to influx api directly to update measurements.
    app.post('/api/write-on-db/', (req, res) => {
        const statusCode = writeOnDb(req.body.httpUrl, req.body.queryParams, req.body.dataToSend);
        res.send(statusCode);
    });

    app.get('/api/retrieve/all', (req, res) => {
        let dirPath = "public/";
        let list=[];
        fs.readdir(dirPath, function (err, files) {
            if (err) {
                return console.log('Unable to scan dir ' + err);
            }
            files.forEach(function (file) {
                if(file !== '.gitkeep') {
                    let contents = fs.readFileSync(dirPath+file, 'utf8');
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

    app.post('/api/read-from-db', (req, res) => {
        const statusCode = readFromDb(req.body.httpUrl, req.body.queryParams);
        res.send(statusCode);
    });

    app.post('/api/save/', (req, res) => {
        //generate uid
        uid(5, (err, id) => {
            if (err) throw err;

            //insert (or override if already exists) uid in network json definition
            req.body.id = id;
            let data = JSON.stringify(req.body);

            //save network with filename in this form: network_uid.json
            let filePath = `./public/network_${id}.json`;
            fs.writeFile(filePath, data, (err => {
                if (err) throw err;
                res.send('bayesian network has been saved');
            }));
        });
    });
};