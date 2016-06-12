var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var scoreUtils = require(global.DIR + '/scoreutils');
var eventUtils = require(global.DIR + '/eventutils');
var Utils = require(global.DIR + '/utils');
var log = require('log-util');

router.get('/getscore/:subid', function(req, res) {
	if (userUtils.userExistsSync(req.params.subid)) {
		res.send(scoreUtils.getScore(req.params.subid).toString());
	} else {
		res.send((-1).toString());
	}
});

router.get('/getbadges/:subid', function(req, res) {
	if (userUtils.userExistsSync(req.params.subid)) {
		var user = userUtils.getUserSync(req.params.subid);
		res.send(user.badges);
	} else {
		res.send([]);
	}
});

router.get('/api/user/atevent/:subid/:eid', function(req, res) {
	res.send(eventUtils.already(req.params.subid, req.params.eid).toString());
});

router.post('/api/user/login', function(req, res) {
	if (req.body.usertoken == undefined) {
		res.statusCode = 400;
		res.send({
			error: new Error("Invalid UserToken").message
		});
	} else {
		userUtils.verifyToken(req.body.usertoken, function(err, user) {
			if (!err && user !== undefined) {
				if (userUtils.userExistsSync(user.sub)) {
					var u = userUtils.getUserSync(user.sub);
					res.send(u);
				} else {
					if (req.body.nickname == undefined) {
						req.body.nickname = user.given_name | user.givenName;
					}
					userUtils.createUser(user.sub, req.body.nickname, function(err, user) {
						if (err) {
							res.statusCode = 400;
							res.send({
								error: err.message
							});
						} else {
							res.send(user);
						}
					});
				}
			} else {
				res.statusCode = 400;
				log.error(err);
				res.send({
					error: err.message
				});
			}
		});
	}
});

router.get('/leaderboard', function(req, res) {
	scoreUtils.generateLeaderboard(function(leaderboard) {
		res.send(leaderboard);
	});
});

module.exports = router;
