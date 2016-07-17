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

router.use(function(req, res, next) {
    if (req.authorized) {
        return next();
    } else {
        res.statusCode = 400;
        var err = new Error("Missing or Invalid Authorization Header");
        return res.json(Utils.getErrorObject(err));
    }
});

router.get('/:subid/score', function(req, res) {
    if (req.authorizedUser.hasPermissions(["user.view.public", "user.view.details", "user.view.all"]) || req.authorizedUser.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.send(req.verifiedUser.getScore().toString());
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.get('/:subid/scores', function(req, res) {
    if (req.authorizedUser.hasPermissions(["user.view.details", "user.view.all"]) || req.authorizedUser.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.json(req.verifiedUser.scores);
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.put('/:subid/score', function(req, res) {
    if (req.authorizedUser.hasPermission("user.edit.score")) {
        if (req.verified) {
            req.verifiedUser.giveScore({
                value: req.body.value ? req.body.value : 0,
                type: "admin"
            });
            req.verifiedUser.save(function(err, dbUser) {
                if (err) {
                    res.statusCode = 500;
                    return res.json(Utils.getErrorObject(err));
                } else {
                    return res.send(req.verifiedUser.getScore().toString());
                }
            });
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.delete('/:subid/score', function(req, res) {
    if (req.authorizedUser.hasPermission("user.edit.score")) {
        if (req.verified) {
            if (req.verifiedUser.removeScore(req.body.timestamp ? req.body.timestamp : Date.now())) {
                var err = new Error("Failed to Edit User");
                res.statusCode = 400;
                return res.json(Utils.getErrorObject(err));
            } else {
                req.verifiedUser.save(function(err, dbUser) {
                    if (err) {
                        res.statusCode = 500;
                        return res.json(Utils.getErrorObject(err));
                    } else {
                        return res.send(req.verifiedUser.getScore().toString());
                    }
                });
            }
        }
    } else {
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(new Error("Permission Requirements Not Met")));
    }
});

router.get('/:subid/badges', function(req, res) {
    if (req.authorizedUser.hasPermissions(["user.view.public", "user.view.details", "user.view.all"]) || req.authorizedUser.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.json(user.badges);
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.put('/:subid/badge/:bid', function(req, res) {
    if (req.authorizedUser.hasPermission("user.edit.badge")) {
        if (req.verified) {
            req.verifiedUser.giveBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
            req.verifiedUser.save(function(err, dbUser) {
                if (err) {
                    return res.json(Utils.getErrorObject(err));
                } else {
                    return res.json(user.badges);
                }
            });
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.delete('/:subid/badge/:bid', function(req, res) {
    if (req.authorizedUser.hasPermission("user.edit.badge")) {
        if (req.verified) {
            req.verifiedUser.takeBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
            req.verifiedUser.save(function(err, dbUser) {
                if (err) {
                    return res.json(Utils.getErrorObject(err));
                } else {
                    return res.json(user.badges);
                }
            });
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.get('/:subid/public', function(req, res) {
    if (req.authorizedUser.hasPermissions(["user.view.public", "user.view.details", "user.view.all"]) || req.authorizedUser.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.json(req.verifiedUser.getPublicUser());
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.get('/:subid/details', function(req, res) {
    if (req.authorizedUser.hasPermissions(["user.view.details", "user.view.all"]) || req.authorizedUser.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.json(req.verifiedUser.exportUser());
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.get('/:subid/all', function(req, res) {
    if (req.authorizedUser.hasPermission("user.view.all")) {
        if (req.verified) {
            return res.json(req.verifiedUser.exportAll());
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.get('/:subid/attending/:eid', function(req, res) {
    res.statusCode = 400;
    var err = new Error("DeprecationWarning");
    return res.json(Utils.getErrorObject(err));
});

router.get('/:subid/name', function(req, res) {
    if (req.authorizedUser.hasPermission("user.view.public") || req.authorizedUser.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.send(req.verifiedUser.name);
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.put('/:subid/name', function(req, res) {
    if (req.authorizedUser.hasPermission("user.edit.name") || req.authorizedUser.subid === req.verifiedUser.subid) {
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
        }
    } else {
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(new Error("Permission Requirements Not Met")));
    }
});

router.get('/:subid/nickname', function(req, res) {
    if (req.authorizedUser.hasPermission("user.view.public") || req.authorizedUser.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.send(req.verifiedUser.nickname);
        }
    } else {
        res.statusCode = 400;
        var err = new Error("Permission Requirements Not Met");
        return res.json(Utils.getErrorObject(err));
    }
});

router.put('/:subid/nickname', function(req, res) {
    if (req.authorizedUser.hasPermission("user.edit.nickname") || req.authorizedUser.subid === req.verifiedUser.subid) {
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
        }
    } else {
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(new Error("Permission Requirements Not Met")));
    }
});

router.get('/leaderboard', function(req, res) {
    User.getLeaderboard(function(err, scores) {
        if (err) {
            return res.json([])
        } else {
            return res.json(scores);
        }
    });
});

router.get('/:subid', function(req, res) {
    request.get("http://localhost/api/user/v1/" + req.params.subid + "/public" + req.originalUrl.substring(req.originalUrl.indexOf('?')), function(err, resp, body) {
        if (err) {
            return res.json(Utils.getErrorObject(err));
        } else {
            return res.json(JSON.parse(body));
        }
    });
});

module.exports = router;
