var express = require('express');
var router = express.Router({
    mergeParams: true
});
var Utils = require(global.DIR + '/utils');
var Badge = require(global.DIR + '/classes/badge');

router.get('/getbadge/:bid', function(req, res) {
    if (Badge.badgeExists(req.params.bid.toString().trim())) {
        return res.json(Badge.getBadge(req.params.bid.toString().trim()).object());
    } else {
        var err = new Error('Badge Not Found');
        res.statusCode = 400;
        return res.json(Utils.getErrorObject(err));
    }
});

router.get(['/getbadges', '/badges'], function(req, res) {
    var badges = [];
    Badge.getBadges().forEach(function(b) {
        badges.push(b.object());
    });
    return res.json(badges);
});

module.exports = router;
