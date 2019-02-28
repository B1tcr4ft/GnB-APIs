const { exec, spawn } = require('child_process');
const MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

module.exports = function(app) {

    app.post('/update/api', (req, res) => {
        let oldTime = (new Date()).getTime();
        sendSlackMessage('*API services updating...*', 'API services updating...', '#ffb347');

        exec('cd /home/gnb-backend && git pull', (error) => {
            if(error) {
                sendSlackMessage('*API services error:* ' + error, 'API services error: ' + error, '#ff6961');
            } else {
                exec('cd /home/gnb-backend && npm install', (error) => {
                    if (error) {
                        sendSlackMessage('*API services error:* ' + error, 'API services error: ' + error, '#ff6961');
                    } else {
                        let amountTime = ((new Date()).getTime() - oldTime)/1000;
                        sendSlackMessage('*API services updated!* (' + amountTime + 's)', 'API services updated! (' + amountTime + 's)', '#77dd77');

                        process.on("exit", function () {
                            spawn(process.argv.shift(), process.argv, {
                                cwd: process.cwd(),
                                detached : true,
                                stdio: "inherit"
                            });
                        });
                        process.exit();
                    }
                });
            }
        });

        res.send('updated');
    });

    app.post('/update/grafana', (req, res) => {
        let oldTime = (new Date()).getTime();
        sendSlackMessage('*Grafana plugin updating...*', 'Grafana plugin updating...', '#ffb347');

        exec('cd /var/lib/grafana/plugins/gnb && git pull', (error) => {
            if(error) {
                sendSlackMessage('*Grafana plugin error:* ' + error, 'Grafana plugin error: ' + error, '#ff6961');
            } else {
                exec('cd /var/lib/grafana/plugins/gnb && npm install', (error) => {
                    if(error) {
                        sendSlackMessage('*Grafana plugin error:* ' + error, 'Grafana plugin error: ' + error, '#ff6961');
                    } else {
                        exec('cd /var/lib/grafana/plugins/gnb && npm run build', (error) => {
                            if(error) {
                                sendSlackMessage('*Grafana plugin error:* ' + error, 'Grafana plugin error: ' + error, '#ff6961');
                            } else {
                                exec('sudo service grafana-server restart', (error) => {
                                    if(error) {
                                        sendSlackMessage('*Grafana plugin error:* ' + error, 'Grafana plugin error: ' + error, '#ff6961');
                                    } else {
                                        let amountTime = ((new Date()).getTime() - oldTime)/1000;
                                        sendSlackMessage('*Grafana plugin updated!* (' + amountTime + 's)', 'Grafana plugin updated! (' + amountTime + 's)', '#77dd77');
                                    }
                                });
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