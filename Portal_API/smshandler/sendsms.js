var mongoose = require('mongoose');
//var winston = require('winston');

var http = require('http');
var urlencode = require('urlencode');

var smsconfig = require('./config.js');

exports.sms = function(data)
{
    var msg = urlencode(data.message);
    //var msg = data.message;
    var toNumber = data.numbers;
    var username = smsconfig.username;
    var hash = smsconfig.hashkey;
    var sender = smsconfig.sender;
    var params = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + toNumber + '&message=' + msg;
    var options = {
        host: 'api.textlocal.in',
        path: '/send?' + params
    };

    callback = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
             console.log(str);
        });
        return;
    }
    http.request(options, callback).end();
}