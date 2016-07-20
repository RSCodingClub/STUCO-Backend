'use strict'

var format = require('dateformat'),
    fs = require('fs'),
    path = require('path'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    log = require('log-util'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    helmet = require('helmet'),
    permission = require('permission');

log.setDateFormat("HH:MM:ss");

// StartCom privat key password 9OwkuwSf7SjM7ITFwh9zYyFx5A7yEcFz

// APP private key password DLwOzvvqK9UhT2nW7C4AzwXJiubXBGw9
// CA private key password 5yqj1ssdO1fPA6wDf3PmbvmPNxhPE5um

global.PORT = process.env.PORT ? process.env.PORT : 443;
global.DIR = __dirname;
global.ENV = "developement";

global.API_KEY = "AIzaSyDQhrNxeNTp-uONV9fUuElCylSQF2MHMtI";
global.CALENDAR_ID = "bcervcjfb5q5niuunqbcjk9iig@group.calendar.google.com"; //"rsdmo.org_u4953i62qnu54ue96198b5eoas@group.calendar.google.com"; //"d7qc2o4as3tspi1k9617pdjvho@group.calendar.google.com"; //"rsdmo.org_39313733373631393232@resource.calendar.google.com";
global.ACCEPTABLE_RADIUS = 400;
global.MAX_ACC = 40;

global.ERR_CODES = JSON.parse(fs.readFileSync(global.DIR + '/../res/errorcodes.json'));
global.TZ = JSON.parse(fs.readFileSync(global.DIR + '/../res/timezones.json'));

if (global.ENV === "developement") {
    log.setLevel(log.Log.VERBOSE);
} else if (global.ENV === "production") {
    log.setLevel(log.Log.WARN);
} else {
    log.setLevel(log.Log.DEBUG);
}
var mongoLogin = {
    usr: "mongoose",
    pwd: "5fC7O9p5iNf4gSkNzW0KlqQm9pkJXYMTnA2Z",
    host: "localhost",
    port: "27017",
    db: "stucoapp"
}
mongoose.connect("mongodb://" + mongoLogin.usr + ":" + mongoLogin.pwd + "@" + mongoLogin.host + ":" + mongoLogin.port + "/" + mongoLogin.db);

var Utils = require(global.DIR + '/utils');
var User = require(global.DIR + '/models/user.model');
var Badge = require(global.DIR + '/classes/badge');

// Configure Morgan
app.use(morgan('dev', {
    skip: function(req, res) {
        if (req.url === '/api/csgo' && req.method === "POST") {
            return true;
        }
    }
}));
// Add spacing for nice logging
morgan.token('method', function(req, res) {
    var method = req.method,
        time = "[" + format("isoTime") + "] ",
        length = 8,
        space = Utils.repeatStr(' ', length - req.method.length),
        processid = "[" + process.pid + "] ";
    return time + processid + method + space;
});
morgan.token('url', function(req, res) {
    var url = req.originalUrl || req.url;
    if (req.query.authorization) {
        url = url.substring(0, url.indexOf("authorization=")) + "authorization=***";
    }
    var length = 40,
        space = length < url.length ? '' : (Utils.repeatStr(' ', length - url.length));
    return url + space;
});
morgan.token('response-time', function(req, res) {
    if (!res._header || !req._startAt) return '';
    var diff = process.hrtime(req._startAt);
    var ms = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
    var timeLength = 8;
    return ('' + ms).length > timeLength ? ms : Utils.repeatStr(' ', timeLength - ('' + ms).length) + ms;
});

// Setup Parsing Header Data
app.use(bodyParser.urlencoded({
    extended: 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(methodOverride());

// Setup static files
app.use(express.static(global.DIR + '/../res'));
app.use('/res', function(req, res, next) {
    res.setHeader("Cache-Control", "max-age=86400");
    next();
});
app.set('permission', {
    after: function(req, res, next, authStatus) {
        console.log("AFTER");
        if (authStatus === permission.AUTHORIZED || authStatus === permission.NOT_AUTHORIZED) {
            console.log("Authenticated");
            if (req.verified) {
                req.isSelf = (req.user.subid === req.verifiedUser.subid);
            }
            if (authStatus === permission.AUTHORIZED) {
                console.log("Authoirzed");
                return next();
            } else {
                console.log("Unauthorized");
                res.statusCode = 400;
                return res.json(Utils.getErrorObject(new Error("Permission Requirements Not Met")));
            }
        } else if (authStatus === permission.NOT_AUTHENTICATED) {
            console.log("Unauthenticated");
            res.statusCode = 400;
            return res.json(Utils.getErrorObject(new Error("Missing or Invalid Authentication Header")));
        }
    }
});

// Handle Uncaught Exceptions
process.on('uncaughtException', function(err) {
    log.error("Fatal Error: Exiting Application");
    log.error(err);
    log.error(err.stack);
    mongoose.connection.close();
});

// Handle Warnings
process.on('warning', function(warning) {
    log.warn(warning);
});

// Initialize the HTTPS server
https.createServer({
    key: fs.readFileSync(global.DIR + "/../private/tls/key.pem", "utf-8"),
    cert: fs.readFileSync(global.DIR + "/../private/tls/cert.pem", "utf-8"),
    requestCert: true,
    passphrase: fs.readFileSync(global.DIR + "/../private/tls/passphrase.txt", "utf-8").toString().trim()
}, app).listen(global.PORT, function() {
    log.info('Process ' + process.pid + ' listening on port ' + global.PORT);
    app.use(helmet());
    require(global.DIR + "/server")(app);
});
http.createServer(app).listen(80, function() {
    log.info('Process ' + process.pid + ' listening on port ' + 80);
    // app.use(helmet());
    require(global.DIR + "/server")(app);
});