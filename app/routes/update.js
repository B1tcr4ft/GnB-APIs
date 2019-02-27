const { exec } = require('child_process');
const MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

module.exports = function(app, db) {

    app.get('/update/api', (req, res) => {
        exec('cd /home/gnb-backend && git pull');

        console.log("Reloading API");

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

        sendSlackMessage('*API services restarting!*', 'API services restarting!');
        res.send('updated');
    });

    app.get('/update/grafana', (req, res) => {
        exec('cd /var/lib/grafana/plugins/gnb && git pull');

        console.log("Reloading Grafana");

        setTimeout(function () {
            exec('sudo service grafana-server restart');
        }, 5000);

        sendSlackMessage('*Grafana restarting!*', 'Grafana restarting!');
        res.send('updated');
    });

    function sendSlackMessage(message, fallback) {
        slack.send({
            icon_url: 'https://static.thenounproject.com/png/38239-200.png',
            username: 'BitCraft API',
            attachments: [
                {
                    fallback: fallback,
                    color: '#77dd77',
                    text: message
                }
            ]
        });
    }
};