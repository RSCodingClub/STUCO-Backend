'use strict';

const fs = require('fs');
const log = require('log-util');
const path = require('path');
const http = require('http');
const format = require('dateformat');
const morgan = require('morgan');
const helmet = require('helmet');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const permission = require('permission');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const LocalAPIKeyStrategy = require('passport-localapikey');
const GoogleTokenStrategy = require('passport-google-id-token');

global.CONFIG = require('./app/config.json');

log.setDateFormat(global.CONFIG['date-format']);

global.PORT = process.env.PORT ? process.env.PORT : 443;
global.DIR = __dirname;
global.ENV = process.env.ENV ? process.env.ENV : 'developement';

global.API_KEY = global.CONFIG['api-key'];
global.CLIENT_IDS = global.CONFIG['client-ids'];
global.CALENDAR_ID = global.CONFIG['calendar-id'];
//'d7qc2o4as3tspi1k9617pdjvho@group.calendar.google.com'; // Stuco App Test (Donny's)
//'bcervcjfb5q5niuunqbcjk9iig@group.calendar.google.com'; // Stuco Test Calendar (mine)
//'rsdmo.org_u4953i62qnu54ue96198b5eoas@group.calendar.google.com'; // Student Council Test Event Calendar
//'rsdmo.org_39313733373631393232@resource.calendar.google.com'; // Rockwood Summit-Public Calendar
global.ACCEPTABLE_RADIUS = global.CONFIG['acceptable-radius'];
global.MAX_ACC = global.CONFIG['max-accuracy'];

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
    pwd: fs.readFileSync(path.join(global.DIR, '/../private/mongodb.pwd')).toString().replace(/\r?\n|\r/g, ''),
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

// Allow Forwarding Through Proxy Server
app.enable('trust proxy');

// Setup static files
app.use(express.static(global.DIR + '/../res'));
app.use('/res', function(req, res, next) {
    res.setHeader('Cache-Control', 'max-age=86400');
    next();
});
// Passport
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new LocalAPIKeyStrategy.Strategy({
		passReqToCallback: true
	},
    function(req, apikey, done) {
		console.log('API Login', apikey);
        User.findOne({
            apikey: apikey
        }).then((user) => {
			if (!user) {
                return done(null, false);
            }
			req.user = user;
            return done(null, user);
		}).catch((err) => {
			return done(err);
		});
    }
));
passport.use(new GoogleTokenStrategy({
        clientID: global.CLIENT_IDS,
        getGoogleCerts: userUtils.getGoogleCertificates,
        passReqToCallback: true
    },
    function(req, parsedToken, subid, done) {
        User.getUser(subid).then((user) => {
            if (user == undefined) {
                User.createUser(parsedToken.payload).then((dbUser) => {
                    req.user = dbUser;
                    return done(undefined, dbUser);
                }).catch((err) => {
                    return done(err);
                });
            } else {
                req.user = user;
                return done(undefined, user);
            }
        }).catch((err) => {
            return done(err);
        });
    }
));
app.use(passport.initialize());

// Permission routing
app.set('permission', {
    after: function(req, res, next, authStatus) {
        if (authStatus === permission.AUTHORIZED || authStatus === permission.NOT_AUTHORIZED) {
            if (req.verified) {
				if (req.user.subid == undefined) return next();
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
