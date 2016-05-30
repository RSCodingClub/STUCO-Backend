var express = require('express'),
    app = express(),
    path = require('path'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    userUtils = require(__dirname + '/userutils'),
    badgeUtils = require(__dirname + '/badgeutils'),
    scoreUtils = require(__dirname + '/scoreutils');

var PORT = process.env.PORT | 3000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(methodOverride());

app.listen(PORT, function() {
    console.log('App listening on port ' + PORT);
    require(__dirname + "/routes")(app);
});

process.on('uncaughtException', function(err) {
    console.log(err.stack);
});

//userUtils.createUser("823899009282884900098", "JEFFREY MEYER", "Jeffrey");
//console.log(userUtils.userExists("100033758533830286348"));
//badgeUtils.giveBadge("823899009282884900098", 0);
// scoreUtils.generateLeaderboard(function(leaderboard) {
// 	console.log(leaderboard);
// });
//console.log("823899009282884900098 Score: "+scoreUtils.getScore("823899009282884900098"));
//console.log(badgeUtils.getBadge(0).desc);
