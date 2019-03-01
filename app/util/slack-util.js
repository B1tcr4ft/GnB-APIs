const MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

var exports = module.exports = {};

/**
 * Send a message to the #commits channel in Slack
 * @param message {string} message to send
 * @param fallback {string} fallback message to send
 * @param color {string} hex color of the message
 */
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

exports.sendSlackMessage = sendSlackMessage;