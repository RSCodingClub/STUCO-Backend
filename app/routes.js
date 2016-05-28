var fs = require("fs");
var mime = require('mime');

module.exports = function(app) {
    app.get('/api/user/getscore/:user', function(req, res) {
        console.log(req.method + " Request @ " + req.url);
        res.send((Math.round(Math.random()) ? Math.round(Math.random() * 100) : -1).toString());
    });
    app.post('/api/user/testlocation/', function(req, res) {
        //res.send('Post Success ' + JSON.stringify(req.body));
        console.log(req.body);

        // Within 396.24 meters of 38.5175715,-90.4938848
        // 38.521131;, -90.493044
        // Test if a point is in a circle
        // (x - center_x)^2 + (y - center_y)^2 < radius^2
        var lat1 = 38.521131;
        var lng1 = -90.493044;

        var lat2 = req.body.latitude;
        var lng2 = req.body.longitude;

        var earthRadius = 6371000; //meters
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dLng = (lng2 - lng1) * (Math.PI / 180);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var dist = earthRadius * c;

		var schoolRadius = 396.24;
		if (dist + req.body.accuracy < schoolRadius) {
			res.send(true);
		} else if (dist - req.body.accuracy < schoolRadius) {
			res.send(true);
		} else {
			res.send(false);
		}
    });


    app.get('/', function(req, res) {
        console.log();
        res.send(req.method + " Request @ " + req.url);
    });
}
