var userUtils = require(__dirname + '/../../userutils');
var utils = require(__dirname + '/../../utils');
var request = require('request');;

var eventUtils = require(__dirname + '/../../eventutils');

module.exports = function(app) {
    app.post('/api/event/confirm/:eid', function(req, res) {
        // expected params
        // latitiude = int
        // longitude = int
        // accuracy = int
        // usertoken = rsa256
        var ACCEPTABLE_RADIUS = 400;
        userUtils.verifyToken(req.body.usertoken, function(err, user) {
            if (err) {
                res.send({
                    error: err.message
                });
            } else {
                eventUtils.atEvent(req.params.eid, req.body.latitiude, req.body.longitude, function(err, atevent) {
                    if (err) {
                        res.send({
                            error: err.message
                        });
                    } else {
                        res.send(atevent);
                    }
                });
            }
        });
    });
};
