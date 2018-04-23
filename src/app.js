const fs = require("fs");
const steem = require('steem');

var pretransactionlist = [];
var preaErrorlist = [];

config = JSON.parse(fs.readFileSync("config.json"));
steem.api.setOptions({ url: config.steem_node });

if (fs.existsSync('transactionLog.json')) {
    const transactionlist = JSON.parse(fs.readFileSync("transactionLog.json"));

    if (transactionlist.length) {
        pretransactionlist = transactionlist;
    }
}
if (fs.existsSync('ErrorLog.json')) {
    const Errorlist = JSON.parse(fs.readFileSync("ErrorLog.json"));

    if (Errorlist.length) {
        preaErrorlist = Errorlist;
    }
}

SendAmount();

function SendAmount() {
    config.receiver_account.forEach(function (receiver) {
        console.log("Sending amount " + config.amount + ' to ' + receiver + ' With memo ' + config.memo);
        steem.broadcast.transfer(config.private_active_key, config.sender_account, receiver, config.amount, config.memo, function (err, result) {
            if (err || !result) {
                console.log("Sending failed ! For: " + receiver);
                saveErrorLog(err.code, err.message, config.sender_account, receiver, config.amount, config.memo);
            }
            else {
                console.log("Amount " + config.amount + ' Transfered to ' + receiver + ' Completed .... !');
                saveTransactionLog(result.id, result.block_num, result.expiration, result.ref_block_num, config.sender_account, receiver, config.amount, config.memo);
            }
        });
    });
}

function saveTransactionLog(id, block_num, expiration, ref_block_num, sender, receiver, amount, memo) {
    var atransaction = {
        id: id,
        block_num: block_num,
        expiration: expiration,
        ref_block_num: ref_block_num,
        sender: sender,
        receiver: receiver,
        amount: amount,
        memo: memo,
    };
    pretransactionlist.push(atransaction);

    fs.writeFile('transactionLog.json', JSON.stringify(pretransactionlist), function (err) {
        if (err) {
            console.log(err);
        }
    });
}

function saveErrorLog(code, message, sender, receiver, amount, memo) {
    var aError = {
        code: code,
        message: message,
        sender: sender,
        receiver: receiver,
        amount: amount,
        memo: memo,
    };

    preaErrorlist.push(aError);

    fs.writeFile('ErrorLog.json', JSON.stringify(preaErrorlist), function (err) {
        if (err) {
            console.log(err);
        }
    });
}
