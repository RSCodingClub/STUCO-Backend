var badgeUtils = require(__dirname + "/../../badgeutils");

module.exports = function(app) {
    app.get('/api/badge/getbadge/:bid', function(req, res) {
        res.send(badgeUtils.getBadge(req.params.bid));
    });
    app.get('/api/badge/getbadges', function(req, res) {
        res.send(badgeUtils.getBadges());
    });
};
