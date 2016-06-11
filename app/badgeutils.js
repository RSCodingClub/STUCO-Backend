var fs = require('fs');
var userUtils = require(__dirname + "/userutils");
var scoreUtils = require(__dirname + "/scoreutils");
var log = require('log-util');

var badgeUtils = module.exports = {
    badges: (function() {
        log.verbose("badges()");
        try {
            return JSON.parse(fs.readFileSync(__dirname + "/../res/badges.json"));
        } catch (e) {
            log.error(e.stack);
            return [];
        }
    })(),
    getBadges: function() {
        log.verbose("getBadges()");
        return this.badges;
    },
    getBadge: function(bid) {
        log.verbose("getBadge(" + bid + ")");
        var badge = this.getBadges()[bid];
        if (badge !== undefined) {
            return badge;
        } else {
            return new Error("Invalid Badge ID");
        }
    },
    hasBadge: function(subid, bid, callback) {
        log.verbose("hasBadgeAsync(" + subid + ", " + bid + ", " + typeof callback + ")");
        if (typeof callback == "function") {
            var r = false;
            userUtils.getUser(subid, function(user) {
                user.badges.forEach(function(b, i) {
                    if (b == bid) {
                        r = true;
                    }
                });
                callback(r);
            });
        }
    },
    giveBadge: function(subid, bid, callback) {
        log.verbose("giveBadge(" + subid + ", " + bid + ", " + typeof callback + ")");
        if (callback == undefined) {
            callback = function() {};
        }
        if (userUtils.userExistsSync(subid)) {
            if (!this.hasBadgeSync(subid, bid)) {
                var user = userUtils.getUserSync(subid);
                user.badges.push(bid);
                userUtils.setUser(subid, user, function(err, user) {
                    if (err) {
                        callback(err);
                    } else {
                        scoreUtils.givePointsSync(subid, "badge", badgeUtils.getBadge(bid).reward);
                        callback(undefined, user);
                    }
                });
            }
        } else {
            callback(new Error("User Not Found"));
        }
    },
    hasBadgeSync: function(subid, bid) {
        log.verbose("hasBadgeSync(" + subid + ", " + bid + ")");
        var user = userUtils.getUser(subid),
            r = false;
        userUtils.getUserSync(subid).badges.forEach(function(b, i) {
            if (b == bid) {
                r = true;
            }
        });
        return r;
    }
};
