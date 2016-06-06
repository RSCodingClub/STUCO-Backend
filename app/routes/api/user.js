var userUtils = require(__dirname + '/../../userutils');
var scoreUtils = require(__dirname + '/../../scoreutils');
var eventUtils = require(__dirname + '/../../eventutils');
var Utils = require(__dirname + '/../../utils');
var log = require('log-util');

module.exports = function(app) {
    app.get('/api/user/getscore/:subid', function(req, res) {
        if (userUtils.userExistsSync(req.params.subid)) {
            res.send(scoreUtils.getScore(req.params.subid).toString());
        } else {
            res.send((-1).toString());
        }
    });
    app.get('/api/user/getbadges/:subid', function(req, res) {
        if (userUtils.userExistsSync(req.params.subid)) {
            var user = userUtils.getUserSync(req.params.subid);
            res.send(user.badges);
        } else {
            res.send([]);
        }
    });
    app.post('/api/user/testlocation/', function(req, res) {
        // Within 396.24 meters of 38.5175715,-90.4938848
        // 38.521131;, -90.493044
        // Test if a point is in a circle
        // (x - center_x)^2 + (y - center_y)^2 < radius^2
        var lat1 = 38.521131;
        var lng1 = -90.493044;
        var dist = Utils.getDistance(lat1, lng1, req.body.latitiude, req.body.longitude);

        var schoolRadius = 396.24;
        if (dist + req.body.accuracy < schoolRadius) {
            res.send(true);
        } else if (dist - req.body.accuracy < schoolRadius) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
    app.get('/api/user/atevent/:subid/:eid', function(req, res) {
        res.send(eventUtils.already(req.params.subid, req.params.eid).toString());
    });
    app.post('/api/user/login', function(req, res) {
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
}
