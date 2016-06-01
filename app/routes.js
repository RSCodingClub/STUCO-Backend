var fs = require("fs");
var mime = require('mime');
var userUtils = require(__dirname + '/userutils');
var badgeUtils = require(__dirname + "/badgeutils");
var scoreUtils = require(__dirname + "/scoreutils");
var Utils = require(__dirname + '/utils');

module.exports = function(app) {
    app.get('/api/user/getscore/:gid', function(req, res) {
        userUtils.userExistsAsync(req.params.gid, function(exists) {
            if (exists) {
                scoreUtils.getScoreAsync(req.params.gid, function(score) {
                    res.send(score.toString());
                });
            } else {
                res.send((-1).toString());
            }
        });
    });
    app.get('/api/user/getbadges/:gid', function(req, res) {
        userUtils.userExistsAsync(req.params.gid, function(exists) {
            if (exists) {
                userUtils.getUserAsync(req.params.gid, function(user) {
                    res.send(user.badges);
                });
            } else {
                res.send([]);
            }
        });
    });
    app.get('/api/leaderboard', function(req, res) {
        scoreUtils.generateLeaderboard(function(leaderboard) {
            res.send(leaderboard);
        });
    });
    app.post('/api/user/testlocation/', function(req, res) {
        // Within 396.24 meters of 38.5175715,-90.4938848
        // 38.521131;, -90.493044
        // Test if a point is in a circle
        // (x - center_x)^2 + (y - center_y)^2 < radius^2
        var dist = Utils.getDistance(req.body.latitiude, req.body.longitude);

        var schoolRadius = 396.24;
        if (dist + req.body.accuracy < schoolRadius) {
            res.send(true);
        } else if (dist - req.body.accuracy < schoolRadius) {
            res.send(true);
        } else {
            res.send(false);
        }
    });

    app.post('/api/user/login', function(req, res) {
        userUtils.loginUser(req.body.gid, req.body.name, req.body.nickname, function(user) {
            res.send(user);
        });
    });

    app.get('/api/badge/getbadge/:bid', function(req, res) {
        res.send(badgeUtils.getBadge(req.params.bid));
    });
    app.get('/api/badge/getbadges', function(req, res) {
        res.send(badgeUtils.getBadges());
    });
    app.get('/', function(req, res) {
        res.send("Hello World");
    });
}
