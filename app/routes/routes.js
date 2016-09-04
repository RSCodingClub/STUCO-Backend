var express = require('express');
var router = express.Router({
    mergeParams: true
});
var fs = require('fs');
var Utils = require(global.DIR + '/utils');
var Bugreport = require(global.DIR + '/models/bugreport.model');
var GitHubApi = require('github');
var github = new GitHubApi({
    // optional
    debug: false,
    protocol: 'https',
    host: 'api.github.com', // should be api.github.com for GitHub
    pathPrefix: '', // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        'user-agent': 'STUCO-Backend-Server' // GitHub is happy with a unique user agent
    },
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    includePreview: true // default: false; includes accept headers to allow use of stuff under preview period
});
github.authenticate({
    type: 'basic',
    username: 'rscodingbot',
    password: 'codingclub1'
});

router.get('/', function(req, res) {
    fs.readFile(global.DIR + '/../res/views/index.html', 'utf-8', function(err, body) {
        if (err) {
            res.statusCode = 500;
            return res.send('An unexpected error occurred.');
        } else {
            return res.send(body);
        }
    });
});

router.post(['/submitbug', '/createbugreport', '/submitreport', '/bugreport', '/bug'], function(req, res) {
    // {bugtype, summary, description, syslogs, applogs}
    if (req.authenticated) {
        if (req.user.hasPermission('bugreports.create')) {
            if (req.body.bugtype === undefined || req.body.summary === undefined || req.body.summary.trim() === '' || req.body.description === undefined || req.body.description === '') {
                res.statusCode = 400;
                return res.json(Utils.getErrorObject(new Error('Invalid Request Parameters')));
            } else {
                var bug = new Bugreport({
                    submitter: req.user.subid,
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
                        return res.json(Utils.getErrorObject(err));
                    } else {
                        github.issues.create({
                            user: 'RSCodingClub',
                            repo: 'STUCO-Backend',
                            title: req.body.summary,
                            body: req.body.description,
                            labels: [req.body.bugtype]
                        }, function(err) {
                            if (err) {
                                return res.json(Utils.getErrorObject(err));
                            } else {
                                return res.json(dbBug.pretty());
                            }
                        });
                    }
                });
            }
        } else {
            res.statusCode = 400;
            return res.json(Utils.getErrorObject(new Error('Permission Requirements Not Met')));
        }
    } else {
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(new Error('Missing or Invalid Authorization Header')));
    }
});

router.use('/res', express.static(global.DIR + '/../res'));

module.exports = router;
