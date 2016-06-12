var format = require('dateformat'),
    path = require('path'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    log = require('log-util'),
    express = require('express'),
    app = express();

log.setLevel(log.Log.VERBOSE);
log.setDateFormat("HH:MM:ss");

global.DIR = __dirname;

var utils = require(__dirname + '/utils'),
    userUtils = require(__dirname + '/userutils'),
    badgeUtils = require(__dirname + '/badgeutils'),
    scoreUtils = require(__dirname + '/scoreutils');

// Configure Morgan
app.use(morgan('dev'));
// Add spacing for nice logging
morgan.token('method', function(req, res) {
    var method = req.method,
        time = "[" + format("isoTime") + "] ",
        length = 8,
        space = utils.repeatStr(' ', length - req.method.length),
        processid = "[" + process.pid + "] ";
    return time + processid + method + space;
});
morgan.token('url', function(req, res) {
    var url = req.originalUrl || req.url,
        length = 40,
        space = length < url.length ? '' : (utils.repeatStr(' ', length - url.length));
    return url + space;
});
morgan.token('response-time', function(req, res) {
    if (!res._header || !req._startAt) return '';
    var diff = process.hrtime(req._startAt);
    var ms = diff[0] * 1e3 + diff[1] * 1e-6;
    ms = ms.toFixed(3);
    var timeLength = 8;
    return ('' + ms).length > timeLength ? ms : utils.repeatStr(' ', timeLength - ('' + ms).length) + ms;
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
require(__dirname + "/server")(app);
