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
var mongoose = require('mongoose');
var User = require(global.DIR + '/models/user.model');

router.get('/:subid/score', function(req, res) {
	User.userExists(req.params.subid.toString().trim(), function (exists) {
		if (exists) {
			User.getUser(req.params.subid.toString().trim(), function (err, user) {
				if (err) {
					res.statusCode = 500;
					res.json(Utils.getErrorObject(err));
				} else {
					res.send(user.getScore().toString());
				}
			});
		} else {
			res.statusCode = 404;
	        var err = new Error("User Not Found");
	        res.json(Utils.getErrorObject(err));
		}
	});
});

router.get('/:subid/badges', function(req, res) {
	User.userExists(req.params.subid.toString().trim(), function (exists) {
		if (exists) {
			User.getUser(req.params.subid.toString().trim(), function (err, user) {
				if (err) {
					res.statusCode = 500;
					res.json(Utils.getErrorObject(err));
				} else {
					res.json(user.badges);
				}
			});
		} else {
			res.statusCode = 404;
	        var err = new Error("User Not Found");
	        res.json(Utils.getErrorObject(err));
		}
	});
});

router.get('/:subid/public', function(req, res) {
	User.userExists(req.params.subid.toString().trim(), function (exists) {
		if (exists) {
			User.getUser(req.params.subid.toString().trim(), function (err, user) {
				if (err) {
					res.statusCode = 500;
					res.json(Utils.getErrorObject(err));
				} else {
					res.json(user.getPublicUser());
				}
			});
		} else {
			res.statusCode = 404;
	        var err = new Error("User Not Found");
	        res.json(Utils.getErrorObject(err));
		}
	});
});

router.get('/:subid/attending/:eid', function(req, res) {
    process.emitWarning('AtEvent is deprecated', 'DeprecationWarning');
    try {
        res.send(eventUtils.already(req.params.subid.toString().trim(), req.params.eid.toString().trim()).toString());
    } catch (e) {
        res.statusCode = 400;
        var err = new Error("DeprecationWarning");
        res.json(Utils.getErrorObject(err));
    }
});

router.get('/:subid/nickname', function (req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.public")) {
			User.userExists(req.params.subid.toString().trim(), function (exists) {
				if (exists) {
					User.getUser(req.params.subid.toString().trim(), function (err, user) {
						if (err) {
							res.statusCode = 500;
							res.json(Utils.getErrorObject(err));
						} else {
							res.send(user.nickname);
						}
					});
				} else {
					res.statusCode = 404;
					var err = new Error("User Not Found");
					res.json(Utils.getErrorObject(err));
				}
			});
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

router.put('/:subid/nickname', function (req, res) {
	// Request Body (x-www-form-urlencoded)
	// [nickname]
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.edit.nickname")) {
			User.userExists(req.params.subid.toString().trim(), function (exists) {
				if (exists) {
					User.getUser(req.params.subid.toString().trim(), function (err, user) {
						if (err) {
							res.statusCode = 500;
							res.json(Utils.getErrorObject(err));
						} else {
							if (req.body.nickname) {
								user.nickname = req.body.nickname.toString().trim();
								user.save(function (err, dbUser) {
									res.send(dbUser.nickname);
								});
							}
						}
					});
				} else {
					res.statusCode = 404;
					var err = new Error("User Not Found");
					res.json(Utils.getErrorObject(err));
				}
			});
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
                    User.userExists(guser.sub.toString().trim(), function(exists) {
                        if (exists) {
							User.getUser(guser.sub.toString().trim(), function (err, user) {
								if (err) {
									res.statusCode = 500;
									res.json(Utils.getErrorObject(err));
								} else {
									if (req.body.nickname) {
										user.nickname = req.body.nickname.toString().trim();
									}
									user.lastlogin = new Date();
									user.save();
									res.json(user.exportUser());
								}
							});
                        } else {
                            // Create User
                            User.createUser(guser, function (err, dbUser) {
								if (err) {

								} else {
									user.giveBadge(0);
									user.save(function (err, dbUser) {
		                            	if (err) {
											res.statusCode = 500;
											var e = new Error("Failed to Create User");
											res.json(Utils.getErrorObject(e));
										} else {
											log.info("Welcome " + dbUser.nickname);
											res.json(dbUser.exportUser());
										}
		                            });
								}
                            });
                        }
                    });
                }
            }
        });
    }
});

router.get('/leaderboard', function(req, res) {
	User.getLeaderboard(function(err, scores) {
		if (err) {
	        res.json([])
	    } else {
	        res.json(scores);
	    }
	});
});

router.get('/:subid', function (req, res) {
	if (req.url.endsWith('/')) {
		res.redirect("public");
	} else {
		res.redirect(req.params.subid+"/public");
	}
});

module.exports = router;
