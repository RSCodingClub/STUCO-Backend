var express = require('express');
var router = express.Router({
    mergeParams: true
});
var userUtils = require(global.DIR + '/userutils');
var eventUtils = require(global.DIR + '/eventutils');
var User = require(global.DIR + '/classes/user');
var Badge = require(global.DIR + '/classes/badge');
var Event = require(global.DIR + '/classes/event');

router.get(['/events/:limit/:index','/events/:limit', '/events'], function(req, res) {
	var events = Event.getEvents();
	var r = [];
	events.forEach(function (e, i) {
		r.push(e.nice());
	});
	if (req.params.limit) {
		if (!req.params.index) {
			req.params.index = 0;
		}
		r.splice(0, req.params.index);
		r.splice(req.params.limit, r.length)
	}
	res.json(r);
});
// @param {string} eid - Event ID
router.get(['/details/:eid', '/event/:eid'], function(req, res) {
	if (Event.eventExists(req.params.eid.toString().trim())) {
		var evnt = Event.getEvent(req.params.eid.toString().trim());
		res.json(evnt.object());
	} else {
		res.statusCode = 404;
		res.send({
			error: new Error("Event Not Found").message
		});
	}
});

router.post('/onlocation/:eid', function(req, res) {
    if (!req.body.latitude || !req.body.longitude || !req.body.accuracy) {
        res.statusCode = 400;
        res.send({
            error: new Error("Invalid Location Data").message
        });
    } else {
		req.body.accuracy = req.body.accuracy > global.MAX_ACC ? global.MAX_ACC : Math.abs(req.body.accuracy);
		if (Event.eventExists(req.params.eid.toString().trim())) {
			var evnt = Event.getEvent(req.params.eid.toString().trim());
			evnt.onLocation(parseFloat(req.body.latitude), parseFloat(req.body.longitude), parseFloat(req.body.accuracy), function (err, onlocation) {
				res.send(onlocation.toString());
			});
		} else {
			res.statusCode = 404;
			res.send({
				error: new Error("Event Not Found").message
			});
		}
    }
});

// router.get('/event/:eid', function(req, res) {
//     res.redirect('/details/' + req.params.eid);
// });
// @param {int} latitude
// @param {int} longitude
// @param {int} accuracy
// @param {string} eid - Event ID
// @param {string} usertoken - RSA256 Google User Access Token
router.post('/checkin/:eid', function(req, res) {
    userUtils.verifyToken(req.body.usertoken, function(err, guser) {
        if (err) {
            res.statusCode = 400;
            res.send({
                error: err.message
            });
        } else {
			if (Event.eventExists(req.params.eid.toString().trim())) {
				var evnt = Event.getEvent(req.params.eid.toString().trim());
				evnt.checkin(guser.sub, parseFloat(req.body.latitude), parseFloat(req.body.longitude), function (err, resp) {
					if (err) {
						res.json({
							error: err.message
						});
					} else {
						res.json(resp);
					}
				});
			} else {
				res.json({
					error: new Error("Event Not Found").message
				});
			}
        }
    });
});

module.exports = router;
