var Patient = require('../models/patient'); // refre the Model Exported Object schema
var mongoose = require('mongoose');
//var winston = require('winston');
var moment = require('moment');

var bcrypt = require('bcryptjs');
var crypto = require('crypto');

var sendsms = require('../smshandler/sendsms.js');
var sprintf = require("sprintf-js").sprintf;

//  To check Login ID and Password
exports.checkloginpassword = function(req, res) {
    var loginid = req.body.loginid;
    var password = req.body.password;
    if (!loginid)
        return res.status(401).json({ error: 'ERRORS.INVALIDLOGINPWD' });

    Patient.findOne({ loginid: loginid.toLowerCase() }, 'firstname middlename lastname mrn loginid password orguid patientimageuid externalid', function(err, docs) {
        if (!err) {
            var usr = docs;
            console.log(usr);
            if (usr == null) {
                res.status(401).json({ error: 'ERRORS.INVALIDLOGINPWD' });
            } 
            else if (usr != null && usr.loginid != loginid.toLowerCase()) {
                res.status(401).json({ error: 'ERRORS.INVALIDLOGIN' });
            } 
            else if (usr != null && usr.islocked) {
                res.status(401).json({ error: 'ERRORS.USERLOCKED' });
            } 
            else if (usr != null) {
                bcrypt.compare(password, usr.password, function(berr, bres) {

                    if (bres == true) {
                        req.session.useruid = usr.loginid;
                        req.session.username = usr.firstname + ' ' + usr.middlename + ' ' + usr.lastname;
                        res.status(200).json({ useruid: usr });
                    } 
                    else {
                        res.status(401).json({ error: 'ERRORS.INVALIDLOGINPWD' });
                    }
                });
            }

        }
    });
}


exports.changepassword = function(req, res) {
    var errors = [];
    var userid = req.body.useruid;
    var password = req.body.password;

    bcrypt.hash(password, 10, function(err, hash) {

        if (!err && hash != null) {
            var md5password = crypto.createHash('md5').update(password).digest("base64");

            Patient.update({ loginid: userid }, { password: hash, externalpassword: md5password, modifiedby: req.session.useruid, modifiedat: Date.now() },
                function(err, docs) {
                    if (!err) {
                        res.status(200).json({ uid: userid });
                    }
                });
        }
        // Store hash in your password DB.
    });
}

//  To reset password
exports.resetpassword = function(req, res) {
    var defaultpassword = "password12";

    if (req.body.useruid != null) {

                bcrypt.hash(defaultpassword, 10, function(berr, bhash) {
                    if (!berr) {
                        var md5password = crypto.createHash('md5').update(defaultpassword).digest("base64");

                        Patient.update({ loginid: req.body.useruid }, { password: bhash, externalpassword: md5password, modifiedby: req.session.useruid, modifiedat: Date.now() },
                            function(err) {
                                if (!err) {
                                    res.status(200).json({ uid: req.body.useruid });
                                }
                            });
                    } else {
                        res.status(500).json({
                            error: 'ERRORS.CREATEERROR'
                        });
                    }

                });

    } else {
        //winston.error(err, { timestamp: Date.now(), pid: process.pid, url: req.url });
        res.status(500).json({ error: 'ERRORS.RECORDNOTFOUND' });
    }
}

//  To generate random verification code 
exports.getverificationcode = function(req, res) {
    //  To generate random verification code - 6 digit 
    var vercode = Math.floor(100000 + Math.random() * 900000);    
    res.status(200).json({ code: vercode });
}


//  To test sms
exports.Testsms = function(req, res) {
    var data = {};
    data.numbers = "8754477474";
    data.username = "RAJA";
    data.message = 'Dear %(username)s, Welcome to Patient Portal. Your account is verified now. Please update your profile to refer patients or to receive Referrals. EazyRefer, Customer Care www.eazyrefer.com';
    smsCall(data);
};

//  To verify sms
exports.Verifysms = function(req, res) {
    var data = {};
    data.numbers = req.body.mobilephone;
    //  To generate random verification code 
    //console.log(Math.floor(100000 + Math.random() * 900000));    
    data.verificationcode = req.body.verificationcode;
    data.verifylink = 'http://portal.eazyrefer.com:8040/#!/authentication/verifysignup?code='+req.body.verificationenccode;
    data.message = 'EazyRefer Code: %(verificationcode)s. Dear %(username)s, Thank you for signing up with EazyRefer - Please update the verification code you have recieved in sms/email to activate your account or click this link to verify: %(verifylink)s EazyRefer, Customer Care www.eazyrefer.com';
    data.username =req.body.username;
    smsCall(data);
};

function smsCall(smsdata) {
    var data = {};
    data.numbers = smsdata.numbers;
    data.message = sprintf(smsdata.message,smsdata);
    sendsms.sms(data);
    return;
};
