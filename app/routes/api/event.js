var userUtils = require(__dirname + '/../../userutils');
var utils = require(__dirname + '/../../utils');
var request = require('request');;

var eventUtils = require(__dirname + '/../../eventutils');

module.exports = function(app) {
    app.get('/api/event/events', function(req, res) {
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
    app.get('/api/event/details/:eid', function(req, res) {
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
    // @param {int} latitude
    // @param {int} longitude
    // @param {int} accuracy
    // @param {string} eid - Event ID
    // @param {string} usertoken - RSA256 Google User Access Token
    app.post('/api/event/checkin/:eid', function(req, res) {
        var ACCEPTABLE_RADIUS = 400;
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
                        res.send({
                            error: err.message
                        });
                    } else {
                        if (atevent) {
                            eventUtils.checkin(user.sub, req.params.eid, function(err, user) {
                                if (err) {
                                    res.statusCode = 400;
                                    res.send({
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
};
