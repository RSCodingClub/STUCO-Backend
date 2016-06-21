var format = require('dateformat'),
    fs = require('fs'),
    path = require('path'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    log = require('log-util'),
    express = require('express'),
    app = express();

log.setLevel(log.Log.VERBOSE);
log.setDateFormat("HH:MM:ss");

global.DIR 			= __dirname;
global.API_KEY		= "AIzaSyDQhrNxeNTp-uONV9fUuElCylSQF2MHMtI";
global.CALENDAR_ID 	= "bcervcjfb5q5niuunqbcjk9iig@group.calendar.google.com"; //"d7qc2o4as3tspi1k9617pdjvho@group.calendar.google.com"; //"rsdmo.org_39313733373631393232@resource.calendar.google.com";
global.ACCEPTABLE_RADIUS = 400;
global.MAX_ACC 		= 50;

global.ERR_CODES = JSON.parse(fs.readFileSync(global.DIR + '/../private/errorcodes.json'));

var userUtils = require(global.DIR + '/userutils');
var scoreUtils = require(global.DIR + '/scoreutils');
var badgeUtils = require(global.DIR + '/badgeutils');
var Utils = require(global.DIR + '/utils');
var User = require(global.DIR + '/classes/user');
var Badge = require(global.DIR + '/classes/badge');

// Configure Morgan
app.use(morgan('dev', {
    skip: function(req, res) {
        if (req.url == '/api/csgo' && req.method == "POST") {
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
    var url = req.originalUrl || req.url,
        length = 40,
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

// Handle Uncaught Exceptions
process.on('uncaughtException', function(err) {
	log.error(err.stack);
    fs.writeFileSync(__dirname + "/../private/users.json", JSON.stringify(User.export()), "utf-8");
});

// Handle Warnings
process.on('warning', (warning) => {
	log.warn(warning);
});

// Initialize the server
require(__dirname + "/server")(app);
