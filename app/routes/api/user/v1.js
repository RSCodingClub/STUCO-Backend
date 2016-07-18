var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var Utils = require(global.DIR + '/utils');
var log = require('log-util');
var User = require(global.DIR + '/models/user.model');
var request = require('request');

router.param("subid", function(req, res, next, subid) {
    req.verified = false;
    User.userExists(subid.toString().trim(), function(exists) {
        if (exists) {
            User.getUser(subid.toString().trim(), function(err, user) {
                if (err) {
                    res.statusCode = 500;
                    return res.json(Utils.getErrorObject(err));
                } else {
                    req.verified = true;
                    req.verifiedUser = user;
                    return next();
                }
            });
        } else {
            res.statusCode = 404;
            var err = new Error("User Not Found");
            return res.json(Utils.getErrorObject(err));
        }
    });
});

// router.use(function(req, res, next) {
//     if (req.authenticated) {
//         return next();
//     } else {
//         res.statusCode = 400;
//         var err = new Error("Missing or Invalid Authentication Header");
//         return res.json(Utils.getErrorObject(err));
//     }
// });

router.get('/:subid/score', require('permission')(["student", "tester", "teacher", "developer", "admin"]), function(req, res) {
    if (req.verified || req.isSelf) {
        return res.send(req.verifiedUser.getScore().toString());
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/:subid/scores', require('permission')(["student", "tester", "teacher", "developer", "admin"]), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.scores);
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.put('/:subid/score', require('permission')(["developer", "admin"]), function(req, res) {
    if (req.verified) {
        req.verifiedUser.giveScore({
            value: req.body.value ? req.body.value : 0,
            type: "admin"
        });
        userUtils.saveUser(req.verifiedUser, function(err, dbUser) {
            if (err) {
                return res.json(Utils.getErrorObject(new Error("Unexpected Error")));
            } else {
                return res.send(req.verifiedUser.getScore().toString());
            }
        });
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});
router.delete('/:subid/score', require('permission')(["developer", "admin"]), function(req, res) {
	console.log("1");
    if (req.verified) {
		console.log("2");
        if (req.verifiedUser.removeScore(req.body.timestamp ? req.body.timestamp : Date.now())) {
			console.log("3");
			req.verifiedUser.save(function(err, dbUser) {
                if (err) {
					console.log("4");
                    res.statusCode = 500;
                    return res.json(Utils.getErrorObject(err));
                } else {
					console.log("5");
                    return res.send(req.verifiedUser.getScore().toString());
                }
            });
        } else {
			console.log("6");
			var err = new Error("Failed to Edit User");
            res.statusCode = 400;
            return res.json(Utils.getErrorObject(err));
        }
    } else {
		console.log("7");
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/:subid/badges', require('permission')(["student", "tester", "teacher", "stuco", "developer", "admin"]), function(req, res) {
    if (req.verified) {
        return res.json(user.badges);
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.put('/:subid/badge/:bid', require('permission')(["developer", "admin"]), function(req, res) {
    if (req.verified) {
        req.verifiedUser.giveBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
        req.verifiedUser.save(function(err, dbUser) {
            if (err) {
                return res.json(Utils.getErrorObject(err));
            } else {
                return res.json(user.badges);
            }
        });
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.delete('/:subid/badge/:bid', require('permission')(["developer", "admin"]), function(req, res) {
    if (req.verified) {
        req.verifiedUser.takeBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
        req.verifiedUser.save(function(err, dbUser) {
            if (err) {
                return res.json(Utils.getErrorObject(err));
            } else {
                return res.json(user.badges);
            }
        });
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/:subid/public', require('permission')(["student", "tester", "teacher", "stuco", "developer", "admin"]), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.getPublicUser());
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/:subid/details', require('permission')(["teacher", "stuco", "developer", "admin"]), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.exportUser());
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/:subid/all', require('permission')(["developer", "admin"]), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.exportAll());
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/:subid/attending/:eid', function(req, res) {
    res.statusCode = 400;
    var err = new Error("DeprecationWarning");
    return res.json(Utils.getErrorObject(err));
});

router.get('/:subid/name', require('permission')(["student", "tester", "teacher", "stuco", "developer", "admin"]), function(req, res) {
    if (req.user.hasPermission("user.view.public") || req.user.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.send(req.verifiedUser.name);
        } else {
            return res.json(Utils.getErrorObject(new Error("User Not Found")));
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.put('/:subid/name', require('permission')(["developer", "admin"]), function(req, res) {
    if (req.verified) {
        if (req.body.name) {
            req.verifiedUser.name = req.body.name.toString().trim();
            req.verifiedUser.save(function(err, dbUser) {
                if (err) {
                    return res.json(Utils.getErrorObject(err));
                } else {
                    return res.send(dbUser.name);
                }
            });
        } else {
            var err = new Error("Invalid Request Parameters");
            return res.json(Utils.getErrorObject(err));
        }
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/:subid/nickname', require('permission')(["student", "tester", "teacher", "stuco", "developer", "admin"]), function(req, res) {
    if (req.verified) {
        return res.send(req.verifiedUser.nickname);
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.put('/:subid/nickname', require('permission')(["developer", "admin"]), function(req, res) {
    if (req.verified) {
        if (req.body.nickname) {
            req.verifiedUser.nickname = req.body.nickname.toString().trim();
            req.verifiedUser.save(function(err, dbUser) {
                if (err) {
                    return res.json(Utils.getErrorObject(err));
                } else {
                    return res.send(dbUser.nickname);
                }
            });
        } else {
            var err = new Error("Invalid Request Parameters");
            return res.json(Utils.getErrorObject(err));
        }
    } else {
        return res.json(Utils.getErrorObject(new Error("User Not Found")));
    }
});

router.get('/leaderboard', require('permission')(), function(req, res) {
    User.getLeaderboard(function(err, scores) {
        if (err) {
            return res.json([])
        } else {
            return res.json(scores);
        }
    });
});

module.exports = router;
