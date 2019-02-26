const fs = require('fs');
const jsbayes = require('jsbayes');
const request = require('request');

const { exec } = require('child_process'); //TODO remove this before release

module.exports = function(app, db) {

    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    // Here I need to make calls to influx api directly to update measurements.
    app.get('/api/write-on-db', (req, res) => {
        /* Insert requests
        POST http://68.183.74.78:8086/write?db=mydb&precision=s
        Content-Type: application/x-www-form-urlencoded

        mymeas,mytag=3 myfield=12
        */
        request
            .post('http://68.183.74.78:8086/write?db=mydb&precision=s', {form:'mymeas,mytag=666 myfield=342'})
            .on('response', (response) => {
                console.log(response.body);
            });
        res.send("ok");
        // Query requests
    });

    app.get('/api/', (req, res) => {
       res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

    app.get('/api/retrieve/:id', (req, res) => {
        let filePath = `./public/rete_${req.params.id}.json`;
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
                res.send('<h1>file not found</h1>');
            }else {
                res.send(JSON.parse(data));
            }
        });
    });

    app.post('/api/config', (req, res) => {
        //saving configurations for network with id :id
        let data = JSON.stringify(req.body);
        let filePath = `./public/config.json`;
        fs.writeFile(filePath, data, (err) => {
            if (err){
                res.send(err);
            } else{
                res.send('configuration for databases updated');
            }
        })

    });

    //TODO remove this before release
    app.get('/update', (req, res) => {
        exec('cd /home/gnb-backend && git pull');
        console.log("This is pid " + process.pid);
        setTimeout(function () {
            process.on("exit", function () {
                require("child_process").spawn(process.argv.shift(), process.argv, {
                    cwd: process.cwd(),
                    detached : true,
                    stdio: "inherit"
                });
            });
            process.exit();
        }, 5000);
        res.send('test');
    });

    app.post('/api/retrieve/all', (req, res) => {
        var path = require('path');
        var dirPath = path.join("public/", '');
        var list=[];
        fs.readdir(dirPath, function (err, files) {
            if (err) {
                return console.log('Unable to scan dir ' + err);
            }
            files.forEach(function (file) {
                list.push(file);
            });
            res.send(list);
        });
    });

    app.post('/api/save/:id', (req, res) => {
        filePath = `./public/rete_${req.params.id}.json`;
        if (fs.existsSync(filePath)) {
            res.send('cannot overwrite existing network with same id');
        }else {
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
    });

};