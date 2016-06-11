var log = require('log-util');
var userUtils = require(__dirname + '/userutils');
var cluster = require('cluster');

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

    if (cluster.isMaster) {
        var numWorkers = process.env.THREADS | require('os').cpus().length;
		// numWorkers = 1;

        console.log('Master cluster setting up ' + numWorkers + ' workers...');

        for (var i = 0; i < numWorkers; i++) {
            cluster.fork();
        }

        cluster.on('online', function(worker) {
            console.log('Worker ' + worker.process.pid + ' is online');
        });

        cluster.on('exit', function(worker, code, signal) {
            console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            console.log('Starting a new worker');
            cluster.fork();
        });
    } else {
		process.on('message', function(message) {
            if (message.type === 'shutdown') {
                process.exit(0);
            }
        });
        var badgeRoute = require(__dirname + "/routes/api/badge")(app),
            userRoute = require(__dirname + "/routes/api/user")(app),
            eventRoute = require(__dirname + "/routes/api/event")(app),
            mainRoute = require(__dirname + "/routes/routes")(app),
            server = app.listen(PORT, function() {
                log.info('Process ' + process.pid + ' listening on port ' + PORT);
            });
    }
    userUtils.backupUsers(function(err) {
        if (err)
            log.error("FATAL FAILED TO SAVE USER BACKUP", err)
    });
};
