var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var scoreUtils = require(global.DIR + '/scoreutils');
var eventUtils = require(global.DIR + '/eventutils');
var Utils = require(global.DIR + '/utils');
var log = require('log-util');
var User = require(global.DIR + '/classes/user.js');

router.get('/getscore/:subid', function(req, res) {
    if (User.userExists(req.params.subid.toString())) {
        res.send(User.getUser(req.params.subid.toString()).getScore().toString());
    } else {
        res.send((-1).toString());
    }
});

router.get('/getbadges/:subid', function(req, res) {
    if (User.userExists(req.params.subid.toString())) {
        res.json(User.getUser(req.params.subid.toString()).getBadges());
    } else {
        res.json([]);
    }
});

router.get('/atevent/:subid/:eid', function(req, res) {
    res.send(eventUtils.already(req.params.subid, req.params.eid).toString());
});

router.post('/login', function(req, res) {
    if (req.body.usertoken == undefined) {
        res.statusCode = 400;
        res.send({
            error: new Error("Invalid UserToken").message
        });
    } else {
        userUtils.verifyToken(req.body.usertoken, function(err, guser) {
            if (err) {
                res.statusCode = 400;
                res.send({
                    error: err.message
                });
            } else {
                if (User.userExists(guser.sub)) {
					User.getUser(guser.sub).setNickname(req.body.nickname ? req.body.nickname : guser.given_name);
                    res.send(User.getUser(guser.sub).object());
                } else {
                    var user = new User({
                        subid: guser.sub,
                        nickname: req.body.nickname ? req.body.nickname : guser.given_name
                    });
                    if (user.valid) {
                        res.json(user.object());
                    } else {
                        res.statusCode = 500;
                        res.json({
                            error: new Error("Failed to Create User").message
                        });
                    }
                }
            }
        });
    }
});

router.get('/leaderboard', function(req, res) {
	res.json(User.getLeaderboard());
});

module.exports = router;
