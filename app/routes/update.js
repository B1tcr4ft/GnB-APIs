const { exec } = require('child_process');
const MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

module.exports = function(app) {

    app.post('/update/api', (req, res) => {
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

        sendSlackMessage('*API services restarting!*', 'API services restarting!', '#77dd77');
        res.send('updated');
    });

    app.post('/update/grafana', (req, res) => {
        sendSlackMessage('*Grafana updating...*', 'Grafana updating...', '#ffb347');

        exec('cd /var/lib/grafana/plugins/gnb && git pull', (error) => {
            if(error) {
                sendSlackMessage('*Grafana error:* ' + error, 'Grafana error: ' + error, '#ff6961');
            } else {
                exec('cd /var/lib/grafana/plugins/gnb && npm install', (error) => {
                    if(error) {
                        sendSlackMessage('*Grafana error:* ' + error, 'Grafana error: ' + error, '#ff6961');
                    } else {
                        exec('sudo service grafana-server restart', (error) => {
                            if(error) {
                                sendSlackMessage('*Grafana error:* ' + error, 'Grafana error: ' + error, '#ff6961');
                            } else {
                                sendSlackMessage('*Grafana updated!*', 'Grafana updated!', '#77dd77');
                            }
                        });
                    }
                });
            }
        });

        res.send('updating');
    });

    function sendSlackMessage(message, fallback, color) {
        slack.send({
            icon_url: 'https://static.thenounproject.com/png/38239-200.png',
            username: 'BitCraft API',
            attachments: [
                {
                    fallback: fallback,
                    color: color,
                    text: message
                }
            ]
        });
    }
};