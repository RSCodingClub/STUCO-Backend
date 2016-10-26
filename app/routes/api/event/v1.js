var express = require('express');
var router = express.Router({
    mergeParams: true
});
var Utils = require(global.DIR + '/utils');
var Event = require(global.DIR + '/classes/event');

router.get(['/events/:limit/:index', '/events/:limit', '/events'], function(req, res) {
    var events = Event.getEvents();
	console.log('events', events.length);
    var r = [];
    events.forEach(function(e) {
        if (req.query.data && req.query.data === 'all') {
            r.push(e.object());
        } else {
            r.push(e.nice());
        }
    });
    if (req.params.limit) {
        if (!req.params.index) {
            req.params.index = 0;
        }
        r.splice(0, req.params.index);
        r.splice(req.params.limit, r.length);
    }
    return res.json(r);
});
// @param {string} eid - Event ID
router.get(['/details/:eid', '/event/:eid'], function(req, res) {
    if (Event.eventExists(req.params.eid.toString().trim())) {
        var evnt = Event.getEvent(req.params.eid.toString().trim());
        return res.json(evnt.object());
    } else {
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(new Error('Event Not Found')));
    }
});

router.post(['/onlocation/:eid'], function(req, res) {
    if (!req.body.latitude || !req.body.longitude || !req.body.accuracy) {
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(new Error('Invalid Location Data')));
    } else {
        req.body.accuracy = req.body.accuracy > global.MAX_ACC ? global.MAX_ACC : Math.abs(req.body.accuracy);
        if (Event.eventExists(req.params.eid.toString().trim())) {
            var evnt = Event.getEvent(req.params.eid.toString().trim());
            evnt.onLocation(parseFloat(req.body.latitude), parseFloat(req.body.longitude), parseFloat(req.body.accuracy), function(err, onlocation) {
                if (err) {
                    return res.json(Utils.getErrorObject(err));
                } else {
                    return res.send(onlocation.toString());
                }
            });
        } else {
            res.statusCode = 404;
            return res.json(Utils.getErrorObject(new Error('Event Not Found')));
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
	console.log('Checking in to ', req.params.eid, 'as', req.user);
	// res.send('Under Construction.');
    // TODO: Verify Parameters
    // FIXME: Deprecated
	if (req.isAuthenticated()) {
		if (Event.eventExists(req.params.eid.toString().trim())) {
            var evnt = Event.getEvent(req.params.eid.toString().trim());
            evnt.checkin(req.user, parseFloat(req.body.latitude), parseFloat(req.body.longitude)).then(() => {
				return res.json(req.user.getPublicUser());
			}).catch((err) => {
				res.statusCode = 400;
				return res.json(Utils.getErrorObject(err));
			});
        } else {
            res.statusCode = 400;
            return res.json(Utils.getErrorObject(new Error('Event Not Found')));
        }
	}
});

module.exports = router;
