const { sendSlackMessage } = require('util/slack-util');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set("port", process.env.PORT || 8000);
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

require('./app/routes')(app, {});
app.listen(app.get("port"), () => {
    console.log("server started on port " + app.get("port"));
    sendSlackMessage('*API services started!*', 'API services started!', '#77dd77');
});