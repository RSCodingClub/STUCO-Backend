const express = require('express');
const router = express.Router({
    mergeParams: true
});
const Utils = require(global.DIR + '/utils');
const log = require('log-util');
const User = require(global.DIR + '/models/user.model');

router.param('subid', function(req, res, next, subid) {
    req.verified = false;
    User.userExists(subid.toString().trim()).then((exists) => {
        if (exists) {
            User.getUser(subid.toString().trim()).then((user) => {
                req.verified = true;
                req.verifiedUser = user;
                return next();
            }).catch(() => {
                res.statusCode = 404;
                return res.json(Utils.getErrorObject(new Error('User Not Found')));
            });
        } else {
			res.statusCode = 404;
			return res.json(Utils.getErrorObject(new Error('User Not Found')));
        }
    });
});

// NOTE: Used to deny all non authenticated requests
// router.use(function(req, res, next) {
//     if (req.authenticated) {
//         return next();
//     } else {
//         res.statusCode = 400;
//         return res.json(Utils.getErrorObject(new Error("Missing or Invalid Authentication Header")));
//     }
// });

router.get('/:subid/score', require('permission')(['student', 'tester', 'teacher', 'developer', 'admin']), function(req, res) {
    if (req.verified || req.isSelf) {
        return res.send(req.verifiedUser.getScore().toString());
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/:subid/scores', require('permission')(['student', 'tester', 'teacher', 'developer', 'admin']), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.scores);
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.put('/:subid/score', require('permission')(['developer', 'admin']), function(req, res) {
    if (req.verified) {
        req.verifiedUser.giveScore({
            value: req.body.value ? req.body.value : 0,
            type: 'admin'
        });
        req.verifiedUser.save().then((dbUser) => {
            return res.send(dbUser.getScore().toString());
        }).catch((err) => {
            log.error(err);
            return res.json(Utils.getErrorObject(new Error('Unexpected Error')));
        });
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});
router.delete('/:subid/score', require('permission')(['developer', 'admin']), function(req, res) {
    if (req.verified) {
        if (req.verifiedUser.removeScore(req.body.timestamp ? req.body.timestamp : Date.now())) {
            req.verifiedUser.save().then(() => {
                return res.send(req.verifiedUser.getScore().toString());
            }).catch((err) => {
                res.statusCode = 500;
                return res.json(Utils.getErrorObject(err));
            });
        } else {
            res.statusCode = 400;
            return res.json(Utils.getErrorObject(new Error('Failed to Edit User')));
        }
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/:subid/badges', require('permission')(['student', 'tester', 'teacher', 'stuco', 'developer', 'admin']), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.badges);
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.put('/:subid/badge/:bid', require('permission')(['developer', 'admin']), function(req, res) {
    if (req.verified) {
        req.verifiedUser.giveBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
        req.verifiedUser.save(function(err) {
            if (err) {
                return res.json(Utils.getErrorObject(err));
            } else {
                return res.json(req.verifiedUser.badges);
            }
        });
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.delete('/:subid/badge/:bid', require('permission')(['developer', 'admin']), function(req, res) {
    if (req.verified) {
        req.verifiedUser.takeBadge(Math.abs(Math.trunc(req.params.bid.toString().trim())));
        req.verifiedUser.save(function(err) {
            if (err) {
                return res.json(Utils.getErrorObject(err));
            } else {
                return res.json(req.verifiedUser.badges);
            }
        });
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/:subid/public', require('permission')(['student', 'tester', 'teacher', 'stuco', 'developer', 'admin']), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.getPublicUser());
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/:subid/details', require('permission')(['teacher', 'stuco', 'developer', 'admin']), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.exportUser());
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/:subid/all', require('permission')(['developer', 'admin']), function(req, res) {
    if (req.verified) {
        return res.json(req.verifiedUser.exportAll());
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/:subid/attending/:eid', function(req, res) {
    res.statusCode = 400;
    return res.json(Utils.getErrorObject(new Error('DeprecationWarning')));
});

router.get('/:subid/name', require('permission')(['student', 'tester', 'teacher', 'stuco', 'developer', 'admin']), function(req, res) {
    if (req.user.hasPermission('user.view.public') || req.user.subid === req.verifiedUser.subid) {
        if (req.verified) {
            return res.send(req.verifiedUser.name);
        } else {
            return res.json(Utils.getErrorObject(new Error('User Not Found')));
        }
    } else {
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(new Error('Permission Requirements Not Met')));
    }
});

router.put('/:subid/name', require('permission')(['developer', 'admin']), function(req, res) {
    if (req.verified) {
        if (req.body.name) {
            req.verifiedUser.name = req.body.name.toString().trim();
            req.verifiedUser.save().then((dbUser) => {
                return res.send(dbUser.name);
            }).catch((err) => {
                return res.json(Utils.getErrorObject(err));
            });
        } else {
            return res.json(Utils.getErrorObject(new Error('Invalid Request Parameters')));
        }
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/:subid/nickname', require('permission')(['student', 'tester', 'teacher', 'stuco', 'developer', 'admin']), function(req, res) {
    if (req.verified) {
        return res.send(req.verifiedUser.nickname);
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.put('/:subid/nickname', require('permission')(['developer', 'admin']), function(req, res) {
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
            return res.json(Utils.getErrorObject(new Error('Invalid Request Parameters')));
        }
    } else {
        return res.json(Utils.getErrorObject(new Error('User Not Found')));
    }
});

router.get('/leaderboard', require('permission')(), function(req, res) {
    User.getLeaderboard().then((scores) => {
        return res.json(scores);
    }).catch(() => {
        return res.json([]);
    });
});

module.exports = router;
