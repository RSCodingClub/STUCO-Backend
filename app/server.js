var fs = require('fs');
var http = require('http');

var server = http.createServer(function(req, res){
	require(__dirname + "/routes")(req, res);
});

process.on('uncaughtException', function(err) {
    console.log(err);
});

var PORT = process.env.PORT | 80;
server.listen(PORT, function() {
	console.log("Server Listening on port 80");
});
