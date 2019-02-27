const jsnetwork = require('../util/json-util');
const fs = require('fs');
const jsbayes = require('jsbayes');
const request = require('request');

const MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
const { exec } = require('child_process'); //TODO remove this before release


module.exports = function(app, db) {

    app.get('/', (req, res) => {
        res.redirect('/api/');
    });

    app.get('/api/', (req, res) => {
        res.send('<h1>Benvenuti nella API di bitcraft</h1>');
    });

};