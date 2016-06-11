var log = require('log-util');
var userUtils = require(global.DIR + '/userutils');
var Utils = require(global.DIR + '/utils');
var express = require('express');

var apis = {
	user: {
		v1: require(global.DIR + "/routes/api/user/v1")
	},
	badge: {
		v1: require(global.DIR + "/routes/api/badge/v1")
	},
	events: {
		v1: require(global.DIR + "/routes/api/event/v1")
	}
};

module.exports = function(app) {
    var PORT = process.env.PORT | 3000;
    log.info("Storing Data for " + userUtils.getUsersSync().length + " users");

    setInterval(function() {
        userUtils.updateUsers(function(err, users) {
            if (err) {
                log.error(err.stack);
                process.exit(169);
            }
        });
    }, 1000);

    Utils.initCluster(function() {
        app.use('/api/user/v1/', apis.user.v1);
		app.use('/api/badge/v1/', apis.badge.v1);
		app.use('/api/event/v1/', apis.events.v1);
        app.listen(PORT);
        log.info('Process ' + process.pid + ' listening on port ' + PORT);
    });

    userUtils.backupUsers();
};
