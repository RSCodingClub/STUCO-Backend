'use strict';

const format = require('dateformat');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const log = require('log-util');
const http = require('http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-id-token');
const permission = require('permission');

log.setDateFormat('HH:MM:ss');

// StartCom privat key password 9OwkuwSf7SjM7ITFwh9zYyFx5A7yEcFz

// APP private key password DLwOzvvqK9UhT2nW7C4AzwXJiubXBGw9
// CA private key password 5yqj1ssdO1fPA6wDf3PmbvmPNxhPE5um

global.PORT = process.env.PORT ? process.env.PORT : 443;
global.DIR = __dirname;
global.ENV = process.env.ENV ? process.env.ENV : 'developement';

global.API_KEY = 'AIzaSyDQhrNxeNTp-uONV9fUuElCylSQF2MHMtI';
global.CLIENT_IDS = [
    '407408718192.apps.googleusercontent.com', // Oauth2 Playground
    '967723309632-am5oak97qk8n6fsu1kageopv4be9tj5u.apps.googleusercontent.com' // Mobile Application
];
global.CALENDAR_ID = 'bcervcjfb5q5niuunqbcjk9iig@group.calendar.google.com'; //"rsdmo.org_u4953i62qnu54ue96198b5eoas@group.calendar.google.com"; //"d7qc2o4as3tspi1k9617pdjvho@group.calendar.google.com"; //"rsdmo.org_39313733373631393232@resource.calendar.google.com";
global.ACCEPTABLE_RADIUS = 400;
global.MAX_ACC = 40;

global.ERR_CODES = JSON.parse(fs.readFileSync(path.join(global.DIR, '/../res/errorcodes.json')));
global.TZ = JSON.parse(fs.readFileSync(path.join(global.DIR, '/../res/timezones.json')));

if (global.ENV === 'developement') {
    log.setLevel(log.Log.VERBOSE);
} else if (global.ENV === 'production') {
    log.setLevel(log.Log.WARN);
} else {
    log.setLevel(log.Log.DEBUG);
}
let mongoLogin = {
    usr: 'mongoose',
    pwd: '5fC7O9p5iNf4gSkNzW0KlqQm9pkJXYMTnA2Z',
    host: 'localhost',
    port: '27017',
    db: 'stucoapp'
};
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + mongoLogin.usr + ':' + mongoLogin.pwd + '@' + mongoLogin.host + ':' + mongoLogin.port + '/' + mongoLogin.db);

let Utils = require(path.join(global.DIR, '/utils'));
let userUtils = require(path.join(global.DIR, '/userutils'));
let User = require(path.join(global.DIR, '/models/User.model'));

// Configure Morgan
app.use(morgan('dev', {
    skip: function(req) {
        if (req.url === '/api/csgo' && req.method === 'POST') {
            return true;
        }
    }
}));
// Add spacing for nice logging
morgan.token('method', function(req) {
    let method = req.method,
        time = '[' + format('isoTime') + '] ',
        length = 8,
        space = Utils.repeatStr(' ', length - req.method.length),
        processid = '[' + process.pid + '] ';
    return time + processid + method + space;
});
morgan.token('url', function(req) {
    let url = req.originalUrl || req.url;
    if (req.query.authorization) {
        url = url.substring(0, url.indexOf('authorization=')) + 'authorization=***';
    }
    let length = 40,
        space = length < url.length ? '' : (Utils.repeatStr(' ', length - url.length));
    return url + space;
});
morgan.token('response-time', function(req, res) {
    if (!res._header || !req._startAt) return '';
    let diff = process.hrtime(req._startAt);
    let ms = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
    let timeLength = 8;
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
    res.setHeader('Cache-Control', 'max-age=86400');
    next();
});
// Passport
app.use(passport.initialize());
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new GoogleTokenStrategy({
        clientID: global.CLIENT_IDS,
        getGoogleCerts: userUtils.getGoogleCertificates(),
        passReqToCallback: true
    },
    function(req, parsedToken, subid, done) {
        console.log('req.user', typeof req.user);
        console.log('token', typeof parsedToken);
        User.getUser(subid).then((user) => {
            if (user == undefined) {
                User.createUser(parsedToken).then((dbUser) => {
                    return done(undefined, dbUser);
                }).catch((err) => {
                    return done(err);
                });
            }
            done(undefined, user);
        }).catch((err) => {
            done(err);
        });
    }
));

// Permission routing
app.set('permission', {
    after: function(req, res, next, authStatus) {
		console.log('authStatus', authStatus);
        if (authStatus === permission.AUTHORIZED || authStatus === permission.NOT_AUTHORIZED) {
            if (req.verified) {
                req.isSelf = (req.user.subid === req.verifiedUser.subid);
                return next();
            }
            if (authStatus === permission.AUTHORIZED) {
                return next();
            } else {
                res.statusCode = 400;
                return res.json(Utils.getErrorObject(new Error('Permission Requirements Not Met')));
            }
        } else if (authStatus === permission.NOT_AUTHENTICATED) {
            res.statusCode = 400;
            return res.json(Utils.getErrorObject(new Error('Missing or Invalid Authentication Header')));
        }
    }
});

// Handle Uncaught Exceptions
process.on('uncaughtException', function(err) {
    log.error('Fatal Error: Exiting Application');
    log.error(err);
    log.error(err.stack);
    mongoose.connection.close();
});

// Handle Warnings
process.on('warning', function(warning) {
    log.warn(warning);
});

// Initialize the HTTPS server
// NOTE: Disabled HTTPS because of Cloudflare
// https.createServer({
//     key: fs.readFileSync(global.DIR + '/../private/tls/key.pem', 'utf-8'),
//     cert: fs.readFileSync(global.DIR + '/../private/tls/cert.pem', 'utf-8'),
//     requestCert: true,
//     passphrase: fs.readFileSync(global.DIR + '/../private/tls/passphrase.txt', 'utf-8').toString().trim()
// }, app).listen(global.PORT, function() {
//     log.info('Process ' + process.pid + ' listening on port ' + global.PORT);
//     app.use(helmet());
//     require(global.DIR + '/server')(app);
// });
http.createServer(app).listen(80, function() {
    log.info('Process ' + process.pid + ' listening on port ' + 80);
    app.use(helmet());
    require(global.DIR + '/server')(app);
});
