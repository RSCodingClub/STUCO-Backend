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
        res.send(User.getUser(req.params.subid.toString().trim()).getScore().toString());
    } else {
		res.statusCode = 404;
		var err = new Error("User Not Found");
        res.json(Utils.getErrorObject(err));
    }
});

router.get('/getbadges/:subid', function(req, res) {
    if (User.userExists(req.params.subid.toString().trim())) {
        res.json(User.getUser(req.params.subid.toString().trim()).getBadges());
    } else {
		res.statusCode = 404;
		var err = new Error("User Not Found");
        res.json(Utils.getErrorObject(err));
    }
});

router.get('/atevent/:subid/:eid', function(req, res) {
	process.emitWarning('AtEvent is deprecated', 'DeprecationWarning');
    try {
		res.send(eventUtils.already(req.params.subid.toString().trim(), req.params.eid.toString().trim()).toString());
	} catch (e) {
		res.statusCode = 400;
		var err = new Error("DeprecationWarning");
		res.json(Utils.getErrorObject(err));
	}
});

router.post('/login', function(req, res) {
    if (req.body.usertoken == undefined) {
        res.statusCode = 400;
        var err = new Error("Invalid UserToken");
		res.json(Utils.getErrorObject(err));
    } else {
        userUtils.verifyToken(req.body.usertoken.toString().trim(), function(err, guser) {
            if (err) {
                res.statusCode = 400;
				res.json(Utils.getErrorObject(err));
            } else {
				if (guser.email == undefined || guser.email == "" | guser.sub == undefined || guser.sub == "") {
					res.statusCode = 400;
					var err = new Error("Google Token Validation Failed");
					res.json(Utils.getErrorObject(err));
				} else {
					if (User.userExists(guser.sub.toString().trim())) {
						if (req.body.nickname) {
							User.getUser(guser.sub.toString().trim()).setNickname(req.body.nickname.toString().trim());
						}
						if (guser.name) {
							User.getUser(guser.sub.toString().trim()).setName(guser.name.toString());
						}
	                    res.json(User.getUser(guser.sub.toString().trim()).object());
	                } else {
	                    var user = new User({
	                        subid: guser.sub.toString().trim(),
							name: guser.name ? guser.name.toString() : (req.body.nickname ? req.body.nickname.toString().trim() : ""),
	                        nickname: req.body.nickname ? req.body.nickname.toString().trim() : (guser.given_name ? guser.given_name.toString().trim() : (guser.name ? guser.name.toString() : "")),
							email: guser.email
	                    });
	                    if (user.valid) {
							user.giveBadge(0);
	                        res.json(user.object());
	                    } else {
	                        res.statusCode = 500;
	                        var err = new Error("Failed to Create User");
							res.json(Utils.getErrorObject(err));
	                    }
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
