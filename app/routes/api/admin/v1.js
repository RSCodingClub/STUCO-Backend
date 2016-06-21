var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var scoreUtils = require(global.DIR + '/scoreutils');
var eventUtils = require(global.DIR + '/eventutils');
var Utils = require(global.DIR + '/utils');
var Badge = require(global.DIR + '/classes/badge');
var User = require(global.DIR + '/classes/user');
var log = require('log-util');

// TODO: Implement Error Codes

router.post(['/user/users', '/user/getusers'], function(req, res) {
	// [usertoken]
    userUtils.verifyToken(req.body.usertoken, function(err, guser) {
        if (err) {
            res.send({
                error: err.message
            });
        } else {
			if (User.userExists(guser.sub.toString().trim())) {
				var user = User.getUser(guser.sub.toString().trim());
				if (user.hasPermission("user.view.all")) {
					var users = User.getUsers(),
						r = [];
					users.forEach(function(u, i) {
						r.push(u.object());
					});
					res.json(r);
				} else if(user.hasPermission("user.view.public")) {
					var users = User.getUsers(),
						r = [];
					users.forEach(function(u, i) {
						r.push(u.public());
					});
					res.json(r);
				} else {
					var err = new Error("Permission Requirements Not Met");
					res.json({
	                    error: err.message,
						errorid: global.ERR_CODES[err.message]
	                });
				}
			} else {
				res.json({
					error: new Error("Requesting User Not Found").message
				});
			}
        }
    });
});

router.post(['/user/score/change/:subid', '/user/score/modify/:subid'], function(req, res) {
	// [usertoken, score]
    userUtils.verifyToken(req.body.usertoken, function(err, guser) {
        if (err) {
            res.send({
                error: err.message,
				errorid: global.ERR_CODES[err.message]
            });
        } else {
			if (User.userExists(guser.sub.toString().trim())) {

			} else {
				res.json({
					error: new Error("Requesting User Not Found").message,
					errorid: 0
				});
			}


            if (userUtils.hasPermission(user.sub, "user.score.modify")) {
                if (userUtils.userExistsSync(req.params.subid)) {
					scoreUtils.givePointsSync(req.params.subid, "admin", req.body.score);
                    // res.send(userUtils.getUserSync(req.params.subid));
                } else {
					var err = new Error("User Not Found");
                    res.send({
                        error: err.message,
						errorid: global.ERR_CODES[err.message]
                    });
                }
            } else {
                res.send({
                    error: new Error("Permission Requirements Not Met").message
                });
            }
        }
    });
});

router.post(['/user/:subid', '/user/getuser/:subid'], function(req, res) {
	// [usertoken]
    userUtils.verifyToken(req.body.usertoken, function(err, guser) {
        if (err) {
            res.send({
                error: err.message
            });
        } else {
			var user = User.getUser(guser.sub.toString().trim());
			if (User.userExists(req.params.subid.toString().trim())) {
				var u = User.getUser(req.params.subid.toString().trim());
				if (user.hasPermission("user.view.all")) {
				   res.json(u.object());
			   } else if (user.hasPermission("user.view.public")) {
				   res.json(u.getPublicUser());
			   } else {
				   res.send({
						error: new Error("Permission Requirements Not Met").message
					});
			   }
			} else {
				res.send({
					error: new Error("User Not Found").message
				});
			}
        }
    });
});

router.post(['/permissions/give', '/permissions/add'], function(req, res) {
    // [usertoken, subid, permission]
    userUtils.verifyToken(req.body.usertoken, function(err, user) {
        if (err) {
            res.send({
                error: err.message
            });
        } else {
            if (userUtils.hasPermission(user.sub, "user.permissions.give")) {
                if (userUtils.userExistsSync(req.params.subid)) {
                    if (typeof req.body.permission == "string") {
                        res.send(userUtils.givePermission(req.params.subid, req.body.permission));
                    } else {
                        res.send({
                            error: new Error("Invalid Permission Type").message
                        });
                    }
                } else {
                    res.send({
                        error: new Error("User Not Found").message
                    });
                }
            } else {
                res.send({
                    error: new Error("Permission Requirements Not Met").message
                });
            }
        }
    });
});

router.post(['/permissions/take', '/permissions/remove', '/permissions/revoke'], function(req, res) {
    // [usertoken, subid, permission]
    userUtils.verifyToken(req.body.usertoken, function(err, user) {
        if (err) {
            res.send({
                error: err.message
            });
        } else {
            if (userUtils.hasPermission(user.sub, "user.permissions.remove")) {
                if (userUtils.userExistsSync(req.params.subid)) {
                    if (typeof req.body.permission == "string") {
                        res.send(userUtils.removePermission(req.params.subid, req.body.permission));
                    } else {
                        res.send({
                            error: new Error("Invalid Permission Type").message
                        });
                    }
                } else {
                    res.send({
                        error: new Error("User Not Found").message
                    });
                }
            } else {
                res.send({
                    error: new Error("Permission Requirements Not Met").message
                });
            }
        }
    });
});

router.post(['/badge/add/:bid', '/badge/create/:bid'], function(req, res) {
	// [usertoken]
	res.statusCode = 500;
	res.send("Feature Temporarily Disabled.");
});

module.exports = router;
