var express = require('express');
var router = express.Router({
    mergeParams: true
});
var badgeUtils = require(global.DIR + "/badgeutils");

router.get('/getbadge/:bid', function(req, res) {
	res.send(badgeUtils.getBadge(req.params.bid));
});

router.get(['/getbadges', '/badges'], function(req, res) {
	res.send(badgeUtils.getBadges());
});

module.exports = router;
