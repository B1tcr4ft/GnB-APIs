const { exec, spawn } = require('child_process');
const { sendSlackMessage } = require('../util/slack-util');

module.exports = app => {

    app.post('/update/api', (req, res) => {
        sendSlackMessage('*API services restarting...*', 'API services restarting...', '#ffb347');

        exec('cd /home/gnb-backend && git pull', (error) => {
            if(error) {
                sendSlackMessage('*API services error:* ' + error, 'API services error: ' + error, '#ff6961');
            } else {
                exec('cd /home/gnb-backend && npm install', (error) => {
                    if (error) {
                        sendSlackMessage('*API services error:* ' + error, 'API services error: ' + error, '#ff6961');
                    } else {
                        process.on("exit", () => {
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

};