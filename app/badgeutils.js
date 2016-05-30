var fs = require('fs');
var userUtils = require(__dirname + "/userutils");
var scoreUtils = require(__dirname + "/scoreutils");

var badgeUtils = module.exports = {
    getBadges: function() {
        console.log("\tgetBadges()");
        return JSON.parse(fs.readFileSync(__dirname + "/../res/badges.json"));
    },
    getBadge: function(bid) {
        console.log("\tgetBadge(" + bid + ")");
        return this.getBadges()[bid];
    },
    hasBadgeAsync: function(gid, bid, callback) {
        console.log("\thasBadgeAsync(" + gid + ", " + bid + ", " + typeof callback + ")");
        if (typeof callback == "function") {
            var r = false;
            userUtils.getUserAsync(gid, function(user) {
                user.badges.forEach(function(b, i) {
                    if (b == bid) {
                        r = true;
                    }
                });
                callback(r);
            });
        }
    },
    giveBadge: function(gid, bid, callback) {
        console.log("\tgiveBadge(" + gid + ", " + bid + ", " + typeof callback + ")");
        if (callback == undefined) {
            callback = function() {};
        }
        userUtils.userExistsAsync(gid, function(exists) {
            if (exists) {
                badgeUtils.hasBadgeAsync(gid, bid, function(has) {
                    if (has == false) {
                        //users = JSON.parse(fs.readFileSync(__dirname + "/../private/users.json"));
                        scoreUtils.givePoints(gid, "badge", badgeUtils.getBadge(bid).reward, function() {
                            userUtils.getUserAsync(gid, function(user) {
                                user.badges.push(bid);
                                userUtils.setUser(user, function() {
                                    callback(true);
                                });
                            });
                        });
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        });
    },
    hasBadge: function(gid, bid) {
        console.log("\thasBadge(" + gid + ", " + bid + ")");
        var user = userUtils.getUser(gid),
            r = false;
        console.log("BDGS", user.badges);
        user.badges.forEach(function(b, i) {
            if (b == bid) {
                r = true;
            }
        });
        return r;
    }
};
