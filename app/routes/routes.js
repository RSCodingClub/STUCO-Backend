var express = require('express');
var router = express.Router({
    mergeParams: true
});
var fs = require('fs');
var log = require('log-util');
var Utils = require(global.DIR + '/utils');
var userUtils = require(global.DIR + '/userutils');
var User = require(global.DIR + '/models/user.model');
var Bugreport = require(global.DIR + '/models/bugreport.model');
var GitHubApi = require("github");
var github = new GitHubApi({
    // optional
    debug: false,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "", // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "STUCO-Backend-Server" // GitHub is happy with a unique user agent
    },
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    includePreview: true // default: false; includes accept headers to allow use of stuff under preview period
});
github.authenticate({
    type: "basic",
    username: "rscodingbot",
    password: "codingclub1"
});

router.use(function(req, res, next) {
    if ((req.headers.authorization && req.headers.authorization.startsWith("Token ")) || (req.query.authorization && req.query.authorization.startsWith("Token "))) {
        var token = req.headers.authorization ? req.headers.authorization : req.query.authorization;
        res.set("Authorized", false);
        var s = process.hrtime();
        userUtils.verifyToken(token.substring("Token ".length), function(err, guser) {
            if (err) {
                res.statusCode = 400;
                res.json(Utils.getErrorObject(err));
            } else {
                // TODO ADD QUOTA CHECKING
                User.userExists(guser.payload.sub.toString().trim(), function(exists) {
                    if (exists) {
                        User.getUser(guser.payload.sub.toString().trim(), function(err, user) {
                            if (!err) {
                                req.authorizedUser = user;
                                req.authorized = true;
                                res.set("Authorized", true);
                            }
                            var time = process.hrtime(s);
                            log.verbose("Authorize User took\t" + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + "ms.");
                            return next();
                        });
                    } else {
                        // Create User
                        User.createUser(guser, function(err, dbuser) {
                            if (!err) {
                                req.authorizedUser = dbUser;
                                req.authorized = true;
                                res.set("Authorized", true);
                            }
                            var time = process.hrtime(s);
                            log.verbose("Authorize User took\t" + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + "ms.");
                            return next();
                        });
                    }
                });
            }
        });
    } else {
        next()
    }
});

router.get('/', function(req, res) {
    fs.readFile(global.DIR + '/../res/views/index.html', 'utf-8', function(err, body) {
        if (err) {
            res.statusCode = 500;
            res.send("An unexpected error occurred.");
        } else {
            res.send(body);
        }
    });
});

router.get(['/submitbug', '/createbugreport', '/submitreport', '/bugreport', '/bug'], function(req, res) {
    res.send("Please submit bug reports through the app.");
});

router.post(['/submitbug', '/createbugreport', '/submitreport', '/bugreport', '/bug'], function(req, res) {
    // {bugtype, summary, description, syslogs, applogs}
    if (req.authorized) {
        if (req.authorizedUser.hasPermission("bugreports.create")) {
            if (req.body.bugtype === undefined || req.body.summary === undefined || req.body.summary.trim() === "" || req.body.description === undefined || req.body.description === "") {
                res.statusCode = 400;
                var err = new Error("Invalid Request Parameters");
                res.json(Utils.getErrorObject(err));
            } else {
                var bug = new Bugreport({
                    submitter: req.authorizedUser.subid,
                    bugtype: req.body.bugtype,
                    summary: req.body.summary,
                    description: req.body.description,
                    syslogs: req.body.syslogs,
                    applogs: req.body.applogs
                });
                bug.save(function(err, dbBug) {
                    if (err) {
                        console.error(err, err.stack);
                        res.statusCode = 500;
                        res.json(Utils.getErrorObject(err));
                    } else {
                        var r = github.issues.create({
                            user: "RSCodingClub",
                            repo: "STUCO-Backend",
                            title: req.body.summary,
                            body: req.body.description,
                            labels: [req.body.bugtype]
                        }, function(err, resp) {
                            if (err) {
                                res.json(Utils.getErrorObject(err));
                            } else {
                                res.json(dbBug.pretty());
                            }
                        });
                    }
                });
            }
        } else {
            res.statusCode = 400;
            var err = new Error("Permission Requirements Not Met");
            res.json(Utils.getErrorObject(err));
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Missing or Invalid Authorization Header");
        res.json(Utils.getErrorObject(err));
    }
});

router.use('/res', express.static(global.DIR + '/../res'));

module.exports = router;
