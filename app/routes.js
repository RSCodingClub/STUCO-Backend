var fs = require("fs");
var mime = require('mime');

module.exports = function(app) {
	app.get('/api/user/getscore/:user', function(req, res) {
		console.log(req.method + " Request @ " + req.url);
		res.send((Math.round(Math.random()) ? Math.round(Math.random()*100) : -1).toString());
	});
	app.post('/api/user/testlocation/', function(req, res) {
	    res.send('Post Success '+JSON.stringify(req.body));
		console.log(req.body);
	});


	app.get('/', function(req, res) {
		console.log();
		res.send(req.method + " Request @ " + req.url);
	});
}
