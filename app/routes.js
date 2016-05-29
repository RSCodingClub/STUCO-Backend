var fs = require("fs");
var mime = require('mime');
var userUtils = require(__dirname + '/userutils');

module.exports = function(app) {
    app.get('/api/user/getscore/:user', function(req, res) {
        res.send((Math.round(Math.random()) ? Math.round(Math.random() * 100) : -1).toString());
    });
    app.post('/api/user/testlocation/', function(req, res) {
        // Within 396.24 meters of 38.5175715,-90.4938848
        // 38.521131;, -90.493044
        // Test if a point is in a circle
        // (x - center_x)^2 + (y - center_y)^2 < radius^2
        var dist = userUtils.getDistance(req.body.latitiude, req.body.longitude);

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
        userUtils.loginUser(req.body.gid, req.body.name, req.body.nickname);
    });

    app.get('/', function(req, res) {
        res.send("Hello World");
    });
}
