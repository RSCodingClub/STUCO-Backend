var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var eventUtils = require(global.DIR + '/eventutils');

var ACCEPTABLE_RADIUS = 400;

router.get('/events', function(req, res) {
    eventUtils.getEvents(function(err, events) {
        if (err) {
            res.statusCode = 400;
            res.send({
                error: err.message
            });
        } else {
            res.send(events);
        }
    });
});
// @param {string} eid - Event ID
router.get(['/details/:eid', '/event/:eid'], function(req, res) {
    eventUtils.getEvent(req.params.eid, function(err, eventdata) {
        if (err) {
            res.statusCode = 400;
            res.send({
                error: err.message
            });
        } else {
            res.send(eventdata);
        }
    });
});

router.post('/onlocation/:eid', function(req, res) {
    if (!req.body.latitude || !req.body.longitude || !req.body.accuracy) {
        res.statusCode = 400;
        res.send({
            error: new Error("Invalid Location Data").message
        });
    } else {
        eventUtils.getEvent(req.params.eid, function(err, event) {
            if (err) {
                res.statusCode = 503;
                res.send({
                    error: err.message
                });
            } else {
                Utils.getLocationFromAddress(address, function(err, location) {
                    if (err) {
                        res.statusCode = 500;
                        res.send({
                            error: err.message
                        });
                    } else {
                        var dist = Utils.getDistance(location.lat, location.lng, req.body.latitude, req.body.longitude);
                        if (dist + acc < ACCEPTABLE_RADIUS) {
                            res.send(true);
                        } else if (dist - acc < ACCEPTABLE_RADIUS) {
                            res.send(true);
                        } else {
                            res.send(false);
                        }
                    }
                });
            }
        });
    }
});

// router.get('/event/:eid', function(req, res) {
//     res.redirect('/details/' + req.params.eid);
// });
// @param {int} latitude
// @param {int} longitude
// @param {int} accuracy
// @param {string} eid - Event ID
// @param {string} usertoken - RSA256 Google User Access Token
router.post('/checkin/:eid', function(req, res) {
    userUtils.verifyToken(req.body.usertoken, function(err, user) {
        if (err) {
            res.statusCode = 400;
            res.send({
                error: err.message
            });
        } else {
            eventUtils.atEvent(req.params.eid, req.body.latitude, req.body.longitude, req.body.accuracy, function(err, atevent) {
                if (err) {
                    res.statusCode = 400;
                    res.json({
                        error: err.message
                    });
                } else {
                    if (atevent) {
                        eventUtils.checkin(user.sub, req.params.eid, function(err, user) {
                            if (err) {
                                res.statusCode = 400;
                                res.json({
                                    error: err.message
                                });
                            } else {
                                res.send(atevent)
                            }
                        });
                    } else {
                        res.send(atevent);
                    }
                }
            });
        }
    });
});

module.exports = router;
