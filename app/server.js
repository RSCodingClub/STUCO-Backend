var log = require('log-util');
var fs = require('fs');
var userUtils = require(global.DIR + '/userutils');
var scoreUtils = require(global.DIR + '/scoreutils');
var badgeUtils = require(global.DIR + '/badgeutils');
var Utils = require(global.DIR + '/utils');
var express = require('express');
var User = require(global.DIR + '/classes/user.js');

var routes = {
    apis: {
        user: {
            v1: require(global.DIR + "/routes/api/user/v1")
        },
        badge: {
            v1: require(global.DIR + "/routes/api/badge/v1")
        },
        events: {
            v1: require(global.DIR + "/routes/api/event/v1")
        },
		admin: {
			v1: require(global.DIR + "/routes/api/admin/v1")
		}
    },
    index: require(global.DIR + "/routes/routes")
};

var exportUsers = function () {
	fs.writeFile(__dirname + "/../private/users.json", JSON.stringify(User.export()), "utf-8", function(err) {
        if (err) {
			throw err;
		} else {
			setTimeout(exportUsers, 1000);
		}
    });
};

module.exports = function(app) {
    var PORT = process.env.PORT | 3000;
    log.info("Storing Data for " + User.getUsers().length + " users");

	exportUsers();

    app.use('/', routes.index);

    app.use('/api/user/v1/', routes.apis.user.v1);
    app.use('/api/badge/v1/', routes.apis.badge.v1);
    app.use('/api/event/v1/', routes.apis.events.v1);
	app.use('/api/admin/v1/', routes.apis.admin.v1);

    app.listen(PORT);
    log.info('Process ' + process.pid + ' listening on port ' + PORT);

	// userUtils.givePermission(103688538784493564468, "*");
	// userUtils.givePermission(100033758533830286348, "*");

	if (User.userExists("103688538784493564468")) {
		User.getUser("103688538784493564468").giveBadge(24);
	}
	if (User.userExists("100033758533830286348")) {
		User.getUser("100033758533830286348").giveBadge(24);
	}

    User.backup();
};
