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
	// if (req.method == "GET") {
	// 	if (req.url.indexOf("/res") == 0) {
	// 		var file_path = decodeURI(req.url).substring(req.url.indexOf(/([A-z]{0,})(\/[A-z]{1,}\.[A-z]{2,})/), req.url.length);
	// 		fs.readFile('.' + file_path, function(err, content) {
	// 			if (err) {
	// 				res.writeHead(404);
	// 				res.end();
	// 			} else {
	// 				res.writeHead(200, {
	// 					'Content-Type': mime.lookup(file_path)
	// 				});
	// 				res.end(content);
	// 			}
	// 		});
	// 	} else if (req.url == "/favicon.ico") {
	// 		res.writeHead(302, {
	// 			'Location': 'res/img/favicon.png'
	// 		});
	// 		res.end();
	// 	} else if (req.url == "/api/getscores") {
	// 		res.end("Testing: Get Scores");
	// 	} else {
	// 		res.writeHead(404);
	// 		res.end("404 Page not found.");
	// 	}
	// } else if (req.method == "POST") {
	// 	if (req.url == "/api/login") {
	// 		res.end("Testing: Login");
	// 	} else if (req.url == "/api/location") {
	// 		res.end("Testing: Location");
	// 	}
	// }
}
