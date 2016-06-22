var express = require('express');
var router = express.Router({
    mergeParams: true
});
var Badge = require(global.DIR + "/classes/badge");

router.get('/getbadge/:bid', function(req, res) {
	if (Badge.badgeExists(req.params.bid.toString().trim())) {
		res.json(Badge.getBadge(req.params.bid.toString().trim()).object());
	} else {
		var err = new Error("Badge Not Found");
		res.statusCode = 400;
		res.json(Utils.getErrorObject(err));
	}
});

router.get(['/getbadges', '/badges'], function(req, res) {
	var badges = [];
	Badge.getBadges().forEach(function (b, i) {
		badges.push(b.object());
	});
	res.json(badges);
});

module.exports = router;
