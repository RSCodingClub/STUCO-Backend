var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var scoreUtils = require(global.DIR + '/scoreutils');
var eventUtils = require(global.DIR + '/eventutils');
var Utils = require(global.DIR + '/utils');
var log = require('log-util');

router.post(['/user/users', '/user/getusers'], function(req, res) {
	// [usertoken]
    userUtils.verifyToken(req.body.usertoken, function(err, user) {
        if (err) {
            res.send({
                error: err.message
            });
        } else {
            if (userUtils.hasPermission(user.sub, "user.view.all")) {
                res.send(userUtils.getUsersSync());
            } else if (userUtils.hasPermission(user.sub, "user.view.public")) {
                var users = userUtils.users;
				users.forEach(function(user, i) {
					delete user['permissions'];
                    delete user['settings'];
					users[i] = user;
				});
				res.send(users);
            } else {
                res.send({
                    error: new Error("Permission Requirements Not Met").message
                })
            }
        }
    });
});

router.post(['/user/:subid', '/user/getuser/:subid'], function(req, res) {
	// [usertoken]
    userUtils.verifyToken(req.body.usertoken, function(err, user) {
        if (err) {
            res.send({
                error: err.message
            });
        } else {
            if (userUtils.hasPermission(user.sub, "user.view.all")) {
                if (userUtils.userExistsSync(req.params.subid)) {
                    res.send(userUtils.getUserSync(req.params.subid));
                } else {
                    res.send({
                        error: new Error("User Not Found").message
                    });
                }
            } else if (userUtils.hasPermission(user.sub, "user.view.public")) {
                if (userUtils.userExistsSync(req.params.subid)) {
                    var user = userUtils.getUserSync(req.params.subid);
                    delete user['permissions'];
                    delete user['settings'];
                    res.send(user);
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

module.exports = router;
