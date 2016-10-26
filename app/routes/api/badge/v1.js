var express = require('express');
var router = express.Router({
    mergeParams: true
});
var Utils = require(global.DIR + '/utils');
var Badge = require(global.DIR + '/models/Badge.model');

router.get('/getbadge/:bid', function(req, res) {
	Badge.badgeExists(req.params.bid.toString().trim()).then((exists) => {
		if (exists) {
			Badge.getBadge(req.params.bid.toString().trim()).then((badge) => {
				return res.json(badge.object());
			}).catch((err) => {
				return res.json(Utils.getErrorObject(err));
			});
			return res.json();
		} else {
			res.statusCode = 400;
			return res.json(Utils.getErrorObject(new Error('Badge Not Found')));
		}
	});
});

router.get('/badges', (req, res) => {
	Badge.getBadges().then((badges) => {
		res.json(badges.map((badge) => {
			// console.log('badge', badge.desc);
			return badge.name;
		}));
	}).catch((err) => {
		console.error('Error', err);
		res.statusCode = 500;
		res.json(Utils.getErrorObject(new Error('Failed to Retrieve Badges')));
	});
});

module.exports = router;
