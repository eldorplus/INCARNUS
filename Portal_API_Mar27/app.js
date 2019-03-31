var express = require("express");
var http = require("http");
var https = require('https');
var appconfig = require('./config.js');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');

var mongoose = require('mongoose');
var compress = require('compression');
var moment = require('moment');

//var winston = require('winston');
//var dailyRotateFile = require('winston-daily-rotate-file');

var port = process.env.PORT || 8080; // set our port
//var httpmode = process.env.HTTPMODE || 'HTTPS';
var httpmode = process.env.HTTPMODE || 'HTTP';

var app = express();

startServer();

function startServer() {

    //var options = { user:"", pass: "", useNewUrlParser: true };
    var options = { useNewUrlParser: true };
    mongoose.connect("mongodb://127.0.0.1:27017/PatientPortal", options, function (err) {
        if (err) console.log(err);
        // utils.mongooseConnected();
    }); // connect to our mongoDB database (commented out after you enter in your own credentials)

    require('fawn').init(mongoose);

    app.use(bodyParser.json({ limit: '15mb' })); // parse application/json and set limit as 1.2 MB
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(bodyParser.urlencoded({ limit: '15mb', extended: true })); // parse application/x-www-form-urlencoded
    app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

    app.all("/*", function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        next();
    });

    app.use(compress());
    app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

    app.use(cookieParser());

    //set default timezone to UTC on the server side.
    process.env.TZ = 'UTC';
    process.env.ENV = 'production';
    process.env.NODE_ENV = 'production';

    //  winston.add(winston.transports.File, { filename: '${appRoot}/logs/app.log' });
    //  winston.remove(winston.transports.Console);

    app.disable('x-powered-by');

    app.use(function (request, response, next) {
        console.log("Incoming URL : " + request.url);
        //response.end("Hello World");
        // allow it
        setSession(request);
        next();
    });

    // routes ==================================================
    require('./routes')(app); // pass our application into our routes

    // start app ===============================================
    if (httpmode == 'HTTP') {
        app.listen(port);
    } else {
        /*var httpsServer = https.createServer({
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem'),
            ca: fs.readFileSync('intermediate.crt')
        }, app);
        httpsServer.keepAliveTimeout = 60000 * 2;
        httpsServer.listen(port);
        */
    }

    console.log('Patient portal runs on port ' + port); // shoutout to the user
    //winston.info('Patient portal runs on port - 3000' , { timestamp: Date.now(), pid: process.pid })
    exports = module.exports = app; // expose app

    //winston.handleExceptions();
    //winston.exitOnError = false;

    process.on('uncaughtException', function (err) {
        console.log('Threw Exception: ', err);
    });

};

function setSession(req) {
    req.session = {};
    req.session.useruid = appconfig.userid ; // "111111111";
    req.session.username = appconfig.username ; // "Raja";
    req.session.orguid = mongoose.Types.ObjectId(appconfig.orgid)  ; // mongoose.Types.ObjectId("569794170946a3d0d588efe6");
    req.session.pagesize = appconfig.pagesize ; // 30;
    req.session.largepagesize = appconfig.largepagesize ; // 100;
    req.session.utcoffset = appconfig.utcoffset ; // 0;
};