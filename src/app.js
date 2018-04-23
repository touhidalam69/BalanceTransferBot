// Adding References on application
const fs = require("fs");
const steem = require('steem');

// This array will store Previous transactions whene application load
var pretransactionlist = [];

// This array will store Previous Error whene application load
var preaErrorlist = [];


// This will retrive data from config.json and store on config which will use on application runtime
config = JSON.parse(fs.readFileSync("config.json"));
// Initialize steem API
steem.api.setOptions({ url: config.steem_node });


// This will Retrive the Data of transactionLog.json file
if (fs.existsSync('transactionLog.json')) {
    const transactionlist = JSON.parse(fs.readFileSync("transactionLog.json"));

    if (transactionlist.length) {
        // Storing Previous Transaction Data to pretransactionlist which will use on application runtime
        pretransactionlist = transactionlist;
    }
}


// This will Retrive the Data of transactionErrorLog.json file
if (fs.existsSync('transactionErrorLog.json')) {
    const Errorlist = JSON.parse(fs.readFileSync("transactionErrorLog.json"));

    if (Errorlist.length) {
        // Storing Previous Error Transaction Data to preaErrorlist which will use on application runtime
        preaErrorlist = Errorlist;
    }
}


//Calling function to transfer balance
SendAmount();


function SendAmount() {
    // Get all Receiver List from config and store it on receiverList
    var receiverList = config.receiver_account;

    // Create a loop on receiverList to transfer balance 
    receiverList.forEach(function (receiver) {
        // This will make a runtime log on console
        console.log("Sending amount " + config.amount + ' to ' + receiver + ' With memo ' + config.memo);

        // Calling API to Transfer Balance
        // This API takes 5 Parameter which Provided
        steem.broadcast.transfer(config.private_active_key, config.sender_account, receiver, config.amount, config.memo, function (err, result) {
            // If any Error occures then this Code block will Execute
            if (err || !result) {
                // This will make a runtime log on console
                console.log("Sending failed ! For: " + receiver);
                // Calling saveErrorLog function to store Error Information on transactionErrorLog.Json file
                saveErrorLog(err.code, err.message, config.sender_account, receiver, config.amount, config.memo);
            }
            // In a Successfull Transaction this Code block will Execute
            else {
                // This will make a runtime log on console
                console.log("Amount " + config.amount + ' Transfered to ' + receiver + ' Completed .... !');
                // Calling saveTransactionLog function to store Transaction Information on transactionLog.Json file
                saveTransactionLog(result.id, result.block_num, result.expiration, result.ref_block_num, config.sender_account, receiver, config.amount, config.memo);
            }
        });
    });
}


function saveTransactionLog(id, block_num, expiration, ref_block_num, sender, receiver, amount, memo) {
    // Making a Transaction object with necessary Information
    var atransaction = {
        id: id,
        block_num: block_num,
        expiration: expiration,
        ref_block_num: ref_block_num,
        sender: sender,
        receiver: receiver,
        amount: amount,
        memo: memo,
        transactionTime: CurrentDate()
    };

    // New Transaction Information is Pushing with Previous Informations
    pretransactionlist.push(atransaction);

    // Tatal Transaction Information writing on transactionLog.json file
    fs.writeFile('transactionLog.json', JSON.stringify(pretransactionlist), function (err) {
        if (err) {
            console.log(err);
        }
    });
}


function saveErrorLog(code, message, sender, receiver, amount, memo) {
    // Making a Error object with necessary Information
    var aError = {
        code: code,
        message: message,
        sender: sender,
        receiver: receiver,
        amount: amount,
        memo: memo,
        transactionTime: CurrentDate()
    };

    // New Transaction Error is Pushing with Previous Informations
    preaErrorlist.push(aError);

    // Tatal Error Information writing on transactionErrorLog.json file
    fs.writeFile('transactionErrorLog.json', JSON.stringify(preaErrorlist), function (err) {
        if (err) {
            console.log(err);
        }
    });
}

// This Function will Return the Current time of System
function CurrentDate() {
    var date = new Date()
    return date.toString();
}