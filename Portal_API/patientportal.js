var express = require('express');
var https = require('https');
var app = express();

var macaddress = require('macaddress');
const helmet = require('helmet');
const frameguard = require('frameguard')


var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
//var morgan = require('morgan');

var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var winston = require('winston');
var dailyRotateFile = require('winston-daily-rotate-file');

var mongoose = require('mongoose');
var compress = require('compression');
var moment = require('moment');

var LoginSession = require('./app/models/framework/loginsessions');
var licensefile = require('./app/framework/licensefile');
var billingUtils = require('./app/billing/utils');
var frameworkInit = require('./app/framework/init');
var utils = require('./app/apputil');

// configuration ===========================================

// config files
var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port
var httpmode = process.env.HTTPMODE || 'HTTPS';

//check for licensing here.
var licensedata = licensefile.getlicense();
if (licensedata == null || licensedata.valid == false) {
    console.log('INVALID LICENSE FILE !!!!  PLEASE CONTACT ADMINISTRATOR');
    return;
}
if (licensedata != null && licensedata.valid == true && licensedata.data != null && licensedata.data.macaddress != null && licensedata.data.macaddress.length > 0) {
    var macaddressmatched = false;
    macaddress.all(function(err, all) {
        Object.keys(all).forEach(function(key) {
            var val = all[key];
            if (val != null && val.mac != null && (val.mac == licensedata.data.macaddress || val.mac.toString().toUpperCase() == licensedata.data.macaddress.toString().toUpperCase())) {
                macaddressmatched = true;
            }
        });
        if (macaddressmatched == false) {
            console.log('NOT LICENSED FOR THIS MAC ADDRESS ' + licensedata.data.macaddress);
            return;
        } else {
            startServer();
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log(httpmode);
    var options = { user: utils.decrypt(db.user), pass: utils.decrypt(db.pass) };
    mongoose.connect(db.url, options, function(err) {
        if (err) console.log(err);
        billingUtils.initBillingModule();
        frameworkInit.initFrameworkModule();
        // utils.mongooseConnected();
    }); // connect to our mongoDB database (commented out after you enter in your own credentials)

    require('fawn').init(mongoose);

    //mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

    // get all data/stuff of the body (POST) parameters
    app.use(bodyParser.json({ limit: '15mb' })); // parse application/json and set limit as 1.2 MB
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(bodyParser.urlencoded({ limit: '15mb', extended: true })); // parse application/x-www-form-urlencoded
    app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

    app.use(compress());
    app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

    app.use(cookieParser());
    app.use(helmet());

    app.use(frameguard({ action: 'deny' }))

    var logDirectory = __dirname + '/log'

    // ensure log directory exists 
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    // create a rotating write stream //'/access-%DATE%.log',
    // var accessLogStream = FileStreamRotator.getStream({
    //     filename: logDirectory + '/access.log',
    //     frequency: 'weekly',
    //     verbose: false
    // });

    //set default timezone to UTC on the server side.
    process.env.TZ = 'UTC';
    process.env.ENV = 'production';
    process.env.NODE_ENV = 'production';

    //app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));
    winston.add(winston.transports.File, { filename: logDirectory + '/incarnus.log' });
    winston.remove(winston.transports.Console);

    app.disable('x-powered-by');

    //interceptors ============================================
    app.use(function(req, res, next) {
        // Put some preprocessing here.
        var token = req.headers['incus-token'];
        if (token != null && token.length > 0) {
            //need to retrieve from session db. hardcoding for now.
            //console.log('token ' + token);
            if (req.cookies != null && req.cookies.lacct != null) {
                setSession(req);
                next();
            } else {
                LoginSession.findById(token, function(err, docs) {
                    if (!err && docs != null) {
                        var loginsession = docs;
                        if (loginsession != null && loginsession.logoutdate == null && loginsession.statusflag == 'A') {
                            // allow it
                            setSession(req);
                            res.cookie('lacct', moment().format('DDMMYHHmmss'), { maxAge: 30000 });
                            next();
                            loginsession.lastactivitydate = new Date();
                            loginsession.save();
                        } else {
                            res.status(440).json({ error: 'ERRORS.INVALIDSESSION' });
                            return;
                        }
                    } else {
                        //console.log(err);
                        res.status(440).json({ error: 'ERRORS.INVALIDSESSION' });
                        return;
                    }
                });
            }
        } else {
            if (req.url.indexOf('/framework') == 0) {
                // allow it
                setSession(req);
                next();
            } else {
                res.status(440).json({ error: 'ERRORS.INVALIDSESSION' });
                return;
            }
        }
    });
    // routes ==================================================
    require('./app/routes')(app); // pass our application into our routes

    // start app ===============================================
    if (httpmode == 'HTTP') {
        app.listen(port);
    } else {
        var httpsServer = https.createServer({
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem'),
            ca: fs.readFileSync('intermediate.crt')
        }, app);
        httpsServer.keepAliveTimeout = 60000 * 2;
        httpsServer.listen(port);

        utils.startsocketserver(httpsServer, db.appurl);
    }
    console.log('Incus runs on port ' + port); // shoutout to the user
    winston.info('Incus runs on port ' + port, { timestamp: Date.now(), pid: process.pid })
    exports = module.exports = app; // expose app

    winston.handleExceptions();
    winston.exitOnError = false;

    process.on('uncaughtException', function(err) {
        console.log('Threw Exception: ', err);
    });
};

function setSession(req) {
    req.session = {};
    req.session.useruid = req.headers['useruid'];
    req.session.username = req.headers['username'];
    req.session.roleuid = req.headers['roleuid'];
    req.session.hasanonymouspermission = req.headers['hasanonymouspermission'];
    req.session.orguid = req.headers['orguid'];
    req.session.parentorguid = req.headers['parentorguid'];
    req.session.utcoffset = req.headers['utcoffset'];
    req.session.departmentuid = req.headers['departmentuid'];
    req.session.pagesize = 30;
    req.session.largepagesize = 100;
};