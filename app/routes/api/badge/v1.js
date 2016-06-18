var express = require('express');
var router = express.Router({
    mergeParams: true
});
var badgeUtils = require(global.DIR + "/badgeutils");
var Badge = require(global.DIR + "/classes/badge");

router.get('/getbadge/:bid', function(req, res) {
	if (Badge.badgeExists(req.params.bid.toString().trim())) {
		res.send(Badge.getBadge(req.params.bid.toString().trim()).object());
	} else {
		res.json([]);
	}
});

router.get(['/getbadges', '/badges'], function(req, res) {
	var badges = [];
	Badge.getBadges().forEach(function (b, i) {
		badges.push(b.object());
	});
	res.json(badges);
	// res.send(badgeUtils.getBadges());
});

module.exports = router;
