const { Network } = require('gnb-network/node');
const { updateNetwork } = require('../util/network-util');
const fs = require('fs');
const request = require('request');

let clockID = [];

module.exports = function(app, db) {

    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    app.get('/api/', (req, res) => {
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    // Here I need to make calls to influx api directly to update measurements.
    app.post('/api/write-on-db/', (req, res) => {
        const statusCode = writeOnDb(req.body.httpUrl, req.body.queryParams, req.body.dataToSend);
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
        let path = require('path'); //TODO check if it's necessary
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

    app.get('/api/start/:id', (req, res) => {
        if(clockID[req.params.id]) {
            res.send('process already started for this network');
        } else {
            let filePath = `./public/rete_${req.params.id}.json`;
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.send('file not found');
                } else {
                    let network = Network.fromJSON(JSON.parse(data));

                    clockID[req.params.id] = setInterval(function () {
                        updateNetwork(network);
                    }, network.refreshTime);

                    res.send('ok');
                }
            });
        }
    });

    app.get('/api/stop/:id', (req, res) => {
        if(clockID[req.params.id]) {
            clearInterval(clockID[req.params.id]);
            clockID = clockID.filter(item => item !== req.params.id);

            res.send('ok');
        } else {
            res.send('no processes running for this network');
        }
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

    app.post('/api/save/:id', (req, res) => {
        let filePath = `./public/rete_${req.params.id}.json`;
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
        let filePath = `./public/rete_${req.params.id}.json`;
        if (!fs.existsSync(filePath)) {
            res.send('network with this id does not exist');
        } else {
            fs.unlink(filePath, (err => {
                if(err) {
                    res.send(err);
                } else {
                    res.send('bayesian network has been deleted!');
                }
            }))
        }
    });

    app.use((req, res)=>{
        res.send('<h1>404 Page not Found</h1> <h2>ho capito che siam veloci ma dacci almeno il weekend</h2>');
    });

    function writeOnDb(httpUrl,
                       queryParams,
                       data){
        request
            .post(`${httpUrl}${queryParams}`, {form:data})
            .on('response', (res) => {
                return res.statusCode;
            });

    }
    /**
     * Query data from specific database*/
    function readFromDb(httpUrl,
                        queryParams) {
        request
            .get(`${httpUrl}${queryParams}`)
            .on('error', function(err) {
                console.log(err)
            })
            .on('data', function(data) {
                // decompressed data as it is received
                console.log(JSON.parse(data).results[0].series[0].values);
            });
    }
};