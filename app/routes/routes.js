var express = require('express');
var router = express.Router({
    mergeParams: true
});
var request = require('request');
var fs = require('fs');
var userUtils = require(global.DIR + '/userutils');
var User = require(global.DIR + '/classes/user');
var badgeUtils = require(global.DIR + '/badgeutils');
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

router.get('/', function(req, res) {
    request.get('http://127.0.0.1:' + global.PORT + '/res/views/index.html', function(err, resp, body) {
        if (err && err !== {}) {
            res.statusCode = 500;
            res.send("An unexpected error occurred.");
        } else {
            res.send(body);
        }
    });
});

router.get(['/submitbug', '/createbugreport', '/submitreport','/bugreport','/bug'], function (req, res) {
	res.send("Please submit bug reports through the app.");
});

router.post(['/submitbug', '/createbugreport', '/submitreport','/bugreport','/bug'], function(req, res) {
    // {usertoken, bugtype, summary, description, syslogs, applogs}
    if (req.body.bugtype == undefined || req.body.summary == undefined || req.body.summary.trim() == "" || req.body.description == undefined || req.body.description == "") {
        var err = new Error("Invalid Request Parameters");
        res.json(Utils.getErrorObject(err));
    } else {
        if (req.body.usertoken == undefined) {
            res.statusCode = 400;
            var err = new Error("Invalid UserToken");
            res.json(Utils.getErrorObject(err));
        } else {
            userUtils.verifyToken(req.body.usertoken, function(err, guser) {
                if (err) {
                    res.statusCode = 401;
                    res.json(Utils.getErrorObject(err));
                } else {
                    if (User.userExists(guser.toString().trim())) {
                        var user = User.getUser(guser.toString().trim());
                        if (user.hasPermission("bugreports.create")) {
                            github.issues.create({
                                user: "RSCodingClub",
                                repo: "STUCO-Backend",
                                title: req.body.summary,
                                body: req.body.description,
                                labels: [req.body.bugtype]
                            });
                            var report = {
                                subid: guser.sub,
                                email: guser.email,
                                name: guser.name,
                                bugtype: req.body.bugtype,
                                summary: req.body.summary,
                                description: req.body.description,
                                syslogs: req.body.syslogs,
                                applogs: req.body.applogs
                            }
                            fs.readFile(global.DIR + "/../private/bugreports.json", "utf-8", function(err, buffer) {
                                try {
                                    var data = JSON.parse(buffer.toString());
                                    data.push(report);
                                    fs.writeFile(global.DIR + "/../private/bugreports.json", JSON.stringify(data), "utf-8", function(err) {
                                        if (err) {
                                            res.statusCode = 500;
                                            res.json(Utils.getErrorObject(err));
                                        } else {
                                            // Successfully submited bug
                                            if (User.userExists(guser.sub.toString().trim())) {
                                                var user = User.getUser(guser.sub.toString().trim());
                                                user.giveBadge(26);
                                                res.send(true);
                                            } else {
                                                res.send(false)
                                            }
                                        }
                                    });
                                } catch (e) {
                                    res.statusCode = 500;
                                    res.json(Utils.getErrorObject(e));
                                }
                            });
                        } else {
                            res.statusCode = 401;
                            var err = new Error("Permission Requirements Not Met");
                            res.json(Utils.getErrorObject(err));
                        }
                    } else {
                        res.statusCode = 404;
                        var err = new Error("Requesting User Not Found");
                        res.json(Utils.getErrorObject(err));
                    }
                }
            });
        }
    }
});

router.use('/res', express.static(global.DIR + '/../res'));

module.exports = router;
