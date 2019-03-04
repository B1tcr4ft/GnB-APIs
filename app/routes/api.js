const {Network} = require('gnb-network/node');
const {JSDOM} = require('jsdom');
const {updateNetwork} = require('../util/network-util');
const {readFromDb, writeOnDb} = require('../util/db-util');
const fs = require('fs');
const uid = require('uid-safe');
const jsbayesviz = require('jsbayes-viz');

let clockList = [];
let activeNetworkList = [];

module.exports = app => {

    app.get('/api/', (req, res) => {
        res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    app.get('/api/retrieve/all', (req, res) => {
        let dirPath = "./public/";
        let list = [];
        fs.readdir(dirPath, (error, files) => {
            if ( isValid(res, error, 'Error while retrieving the network list. Please try again later.') ) {
                files.forEach(file => {
                    if (file !== '.gitkeep') {
                        let contents = fs.readFileSync(dirPath + file, 'utf8');
                        let data = JSON.parse(contents);
                        let bayesianObject = {};
                        bayesianObject.id = data.id;
                        bayesianObject.name = data.name;
                        bayesianObject.active = activeNetworkList[data.id] !== undefined;
                        list.push(bayesianObject);
                    }
                });
                res.send(list);
            }
        });
    });

    app.get('/api/retrieve/:id', (req, res) => {
        getNetworkFromId(req.params.id).then(data => {
            res.send(data);
        }, () => {
            sendError(res, 'There are no networks with this ID.');
        });
    });

    app.get('/api/start/:id', (req, res) => {
        if (clockList[req.params.id]) {
            sendError(res, 'Process already started for this network.');
        } else {
            let filePath = `./public/network_${req.params.id}.json`;
            fs.readFile(filePath, (error, data) => {
                if ( isValid(res, error, 'There are no networks with this ID.') ) {
                    let network = Network.fromJSON(JSON.parse(data));

                    activeNetworkList[network.id] = network;
                    clockList[req.params.id] = setInterval(() => {
                        updateNetwork(network);
                    }, network.refreshTime);

                    res.send('The network has been started!');
                }
            });
        }
    });

    app.get('/api/stop/:id', (req, res) => {
        if (clockList[req.params.id]) {
            clearInterval(clockList[req.params.id]);

            clockList = clockList.filter(val => val !== req.params.id);
            activeNetworkList = activeNetworkList.filter(val => val !== req.params.id);

            res.send('The network has been stopped!');
        } else {
            sendError(res, 'No processes running for this network.');
        }
    });

    app.post('/api/write-on-db/', (req, res) => {
        writeOnDb(req.body.httpUrl, req.body.queryParams, req.body.dataToSend).then(data => {
            res.send(data);
        }, () => {
            sendError(res, 'Error while writing on the database. Please try again later.');
        });
    });

    app.post('/api/read-from-db', (req, res) => {
        readFromDb(req.body.httpUrl, req.body.queryParams).then(data => {
            res.send(data);
        }, () => {
            sendError(res, 'Error while reading from the database. Please try again later.');
        });
    });

    app.post('/api/save', (req, res) => {
        //generate uid
        uid(5, (error, id) => {
            if ( isValid(res, error, 'Error while saving the network. Please try again later.') ) {
                //insert (or override if already exists) uid in network json definition
                req.body.id = id;
                let data = JSON.stringify(req.body);

                //save network with filename in this form: network_uid.json
                let filePath = `./public/network_${id}.json`;
                fs.writeFile(filePath, data, error => {
                    if ( isValid(res, error, 'Error while saving the network. Please try again later.') ) {
                        res.send('The network has been saved!');
                    }
                });
            }
        });
    });

    app.get('/api/delete/:id', (req, res) => {
        if(activeNetworkList[req.params.id]) {
            sendError(res, 'The network is currently active. Please stop it before deleting.');
        } else {
            let filePath = `./public/network_${req.params.id}.json`;
            if (!fs.existsSync(filePath)) {
                sendError(res, 'There are no networks with this ID.');
            } else {
                fs.unlink(filePath, error => {
                    if ( isValid(res, error, 'Error while deleting the network. Please try again later.') ) {
                        res.send('The network has been deleted!');
                    }
                })
            }
        }
    });

    app.post('/api/update/:id', (req, res) => {
        if(activeNetworkList[req.params.id]) {
            sendError(res, 'The network is currently active. Please stop it before updating.');
        } else {
            let filePath = `./public/network_${req.params.id}.json`;
            if (!fs.existsSync(filePath)) {
                sendError(res, 'There are no networks with this ID.');
            } else {
                let data = JSON.stringify(req.body);
                fs.writeFile(filePath, data, (error => {
                    if ( isValid(res, error, 'Error while updating the network. Please try again later.') ) {
                        res.send('The network has been updated!');
                    }
                }));
            }
        }
    });

    app.get('/api/static-graph/:id', (req, res) => {
        getNetworkFromId(req.params.id).then(data => {
            let network = Network.fromJSON(data);
            network.graph.sample(100000);
            let graph = jsbayesviz.fromGraph(network.graph);

            const dom = new JSDOM('<svg id="bbn"></svg>');
            jsbayesviz.draw({
                id: dom.window.document.querySelector('#bbn'),
                width: 800,
                height: 800,
                graph: graph,
                samples: 15000
            });

            res.send(dom.window.document.querySelector("body").innerHTML);
        }, () => {
            sendError(res, 'There are no networks with this ID.');
        });
    });

    app.get('/api/dynamic-graph/:id', (req, res) => {
        if (clockList[req.params.id]) {
            let network = activeNetworkList[req.params.id];
            let graph = jsbayesviz.fromGraph(network.graph);
            let dom = new JSDOM('<svg id="bbn"></svg>');

            jsbayesviz.draw({
                id: dom.window.document.querySelector('#bbn'),
                width: 800,
                height: 800,
                graph: graph,
                samples: 15000
            });

            res.send(dom.window.document.querySelector("body").innerHTML);
        } else {
            sendError(res, 'No processes running for this network.');
        }
    });

    function getNetworkFromId(id) {
        return new Promise((resolve, reject) => {
            let filePath = './public/network_' + id + '.json';
            fs.readFile(filePath, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });
    }

    function isValid(res, error, errorMessage) {
        if(error) {
            sendError(res, errorMessage);
            return false;
        }

        return true;
    }

    function sendError(res, errorMessage) {
        res.status(500);
        res.send(errorMessage);
    }

};