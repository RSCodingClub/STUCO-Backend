var log = require('log-util');
var Event = require(global.DIR + '/classes/event.js');
var User = require(global.DIR + '/models/user.model');

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
        }
    },
    auth: require(global.DIR + "/routes/auth"),
    index: require(global.DIR + "/routes/routes")
};

module.exports = function(app) {
    User.getUsers(function(err, users) {
        log.info("Storing Data for " + (err ? 0 : users.length) + " users");
    });

    app.use('/api', routes.auth);
    app.use('/', routes.index);

    app.use('/api/user/v1/', routes.apis.user.v1);
    app.use('/api/badge/v1/', routes.apis.badge.v1);
    app.use('/api/event/v1/', routes.apis.events.v1);

    log.info('Routes are now defined');

    var evnt = new Event();
};