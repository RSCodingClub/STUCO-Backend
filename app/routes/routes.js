var express = require('express');
var router = express.Router({
    mergeParams: true
});
var fs = require('fs');
var userUtils = require(global.DIR + '/userutils');
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
    // res.send('<html><head><meta name="google-site-verification" content="pirFkTJj7EcnzaStY6ttuG-hHJ2NVceKqBA1Y0lgSRw" /></head></html>');
    res.send("Hello World!");
});

router.post('/submitbug', function(req, res) {
    // TODO Check request body for parameters
    // {usertoken, bugtype, summary, description, syslogs, applogs}
    if (req.body.usertoken == undefined) {
        res.statusCode = 400;
        res.send({
            error: new Error("Invalid UserToken").message
        });
    } else {
        userUtils.verifyToken(req.body.usertoken, function(err, user) {
            if (err) {
				res.statusCode = 401;
                res.send({
                    error: err.message
                });
            } else {
				github.issues.create({
			        user: "RSCodingClub",
			        repo: "STUCO-Backend",
			        title: req.body.summary,
			        body: req.body.description,
			        labels: [req.body.bugtype]
			    });
                var report = {
                    subid: user.sub,
                    email: user.email,
                    name: user.name,
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
								res.send({error: err.message});
							} else {
								// Successfully submited bug
								badgeUtils.giveBadge(subid, 26);
								res.send(true);
							}
						});
					} catch (e) {
						res.statusCode = 500;
						res.send({error: e.message});
					}
				});
            }
        });
    }
});

router.use('/res', express.static(global.DIR + '/../res'));

module.exports = router;
