var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var Utils = require(global.DIR + '/utils');
var log = require('log-util');
var User = require(global.DIR + '/models/user.model');

router.param("subid", function (req, res, next, subid) {
	req.verified = false;
	User.userExists(subid.toString().trim(), function (exists) {
		if (exists) {
			User.getUser(subid.toString().trim(), function (err, user) {
				if (err) {
					res.statusCode = 500;
					res.json(Utils.getErrorObject(err));
				} else {
					req.verified = true;
					req.verifiedUser = user;
					return next();
				}
			});
		} else {
			res.statusCode = 404;
			var err = new Error("User Not Found");
			res.json(Utils.getErrorObject(err));
		}
	});
});

router.get('/:subid/score', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.public") || req.authorizedUser.hasPermission("user.view.details") || req.authorizedUser.hasPermission("user.view.all") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				res.send(req.verifiedUser.getScore().toString());
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

router.get('/:subid/scores', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.details") || req.authorizedUser.hasPermission("user.view.all") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				res.json(req.verifiedUser.scores);
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

router.put('/:subid/score', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.edit.score")) {
			if (req.verified) {
				req.verifiedUser.giveScore({
					value: req.body.value ? req.body.value : 0,
					type: "admin"
				});
				req.verifiedUser.save(function (err, dbUser) {
					if (err) {
						res.statusCode = 500;
						res.json(Utils.getErrorObject(err));
					} else {
						res.send(req.verifiedUser.getScore().toString());
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

router.delete('/:subid/score', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.edit.score")) {
			if (req.verified) {
				if(req.verifiedUser.removeScore(req.body.timestamp ? req.body.timestamp : Date.now())){
					var err = new Error("Failed to Edit User");
					res.statusCode = 400;
					res.json(Utils.getErrorObject(err));
				} else {
					req.verifiedUser.save(function (err, dbUser) {
						if (err) {
							res.statusCode = 500;
							res.json(Utils.getErrorObject(err));
						} else {
							res.send(req.verifiedUser.getScore().toString());
						}
					});
				}
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

router.get('/:subid/badges', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.public") || req.authorizedUser.hasPermission("user.view.details") || req.authorizedUser.hasPermission("user.view.all") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				res.json(user.badges);
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

router.put('/:subid/badge/:bid', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.edit.badge")) {
			if (req.verified) {
				req.verifiedUser.giveBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
				req.verifiedUser.save(function (err, dbUser) {
					if (err) {
						res.json(Utils.getErrorObject(err));
					} else {
						res.json(user.badges);
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

router.delete('/:subid/badge/:bid', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.edit.badge")) {
			if (req.verified) {
				req.verifiedUser.takeBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
				req.verifiedUser.save(function (err, dbUser) {
					if (err) {
						res.json(Utils.getErrorObject(err));
					} else {
						res.json(user.badges);
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

router.get('/:subid/public', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.public") || req.authorizedUser.hasPermission("user.view.details") || req.authorizedUser.hasPermission("user.view.all") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				res.json(req.verifiedUser.getPublicUser());
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

router.get('/:subid/details', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.details") || req.authorizedUser.hasPermission("user.view.all") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				res.json(req.verifiedUser.exportUser());
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

router.get('/:subid/all', function(req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.all")) {
			if (req.verified) {
				res.json(req.verifiedUser.exportAll());
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

router.get('/:subid/attending/:eid', function(req, res) {
    res.statusCode = 400;
    var err = new Error("DeprecationWarning");
    res.json(Utils.getErrorObject(err));
});

router.get('/:subid/name', function (req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.public") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				res.send(req.verifiedUser.name);
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

router.put('/:subid/name', function (req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.edit.name") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				if (req.body.name) {
					req.verifiedUser.name = req.body.name.toString().trim();
					req.verifiedUser.save(function (err, dbUser) {
						if (err) {
							res.json(Utils.getErrorObject(err));
						} else {
							res.send(dbUser.name);
						}
					});
				} else {
					var err = new Error("Invalid Request Parameters");
					res.json(Utils.getErrorObject(err));
				}
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

router.get('/:subid/nickname', function (req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.view.public") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				res.send(req.verifiedUser.nickname);
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

router.put('/:subid/nickname', function (req, res) {
	if (req.authorized) {
		if (req.authorizedUser.hasPermission("user.edit.nickname") || req.authorizedUser.subid === req.params.subid.toString().trim()) {
			if (req.verified) {
				if (req.body.nickname) {
					req.verifiedUser.nickname = req.body.nickname.toString().trim();
					req.verifiedUser.save(function (err, dbUser) {
						if (err) {
							res.json(Utils.getErrorObject(err));
						} else {
							res.send(dbUser.nickname);
						}
					});
				} else {
					var err = new Error("Invalid Request Parameters");
					res.json(Utils.getErrorObject(err));
				}
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
