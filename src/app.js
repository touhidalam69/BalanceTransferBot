const fs = require("fs");
const steem = require('steem');
config = JSON.parse(fs.readFileSync("config.json"));
steem.api.setOptions({ url: config.steem_node });

SendAmount();

function SendAmount() {
    config.receiver_account.forEach(function (receiver) {
        console.log("Sending amount " + config.amount + ' to ' + receiver + ' With memo ' + config.memo);
        steem.broadcast.transfer(config.private_active_key, config.sender_account, receiver, config.amount, config.memo, function (err, result) {
            if (err || !result) {
                console.log("Sending failed ! For: " + receiver);
            }
            else {
                console.log("Amount " + config.amount + ' Transfered to ' + receiver + ' Completed .... !');
            }
        });
    });
}
