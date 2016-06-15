var userUtils = require(__dirname + "/userutils");
var log = require('log-util');

module.exports = {
    givePointsSync: function(subid, type, value, eid) {
        log.verbose("givePointsSync(" + subid + ", " + type + ", " + value + ")");
        log.debug("GIVE POINTS (" + subid + "): " + value + " [" + type + "]");
        if (userUtils.userExistsSync(subid)) {
            var user = userUtils.getUserSync(subid);
            var score = {
                type: type,
                value: value,
                timestamp: Date.now(),
                eid: eid
            };
            user.scores.push(score);
            userUtils.setUser(subid, user);
			// Badge for 50 points
			if (this.getScore(subid) >= 50) {
				require(global.DIR + '/badgeutils').giveBadge(subid, 22);
			}
			// Badge for 100 points
			if (this.getScore(subid) >= 100) {
				require(global.DIR + '/badgeutils').giveBadge(subid, 29);
			}
        } else {
            return new Error("User Not Found");
        }
    },
    getScore: function(subid) {
        log.verbose("getScore(" + subid + ")");
        var score = 0;
        userUtils.getUserSync(subid).scores.forEach(function(s, i) {
            score += s.value;
        });
        return score;
    },
    getScoreAsync: function(subid, callback) {
        log.verbose("getScoreAsync(" + subid + ", " + typeof callback + ")");
        var score = 0;
        userUtils.getUserAsync(subid, function(user) {
            user.scores.forEach(function(s, i) {
                score += s.value;
            });
            callback(score);
        });
    },
    getScores: function(callback) {
        log.verbose("getScores(" + typeof callback + ")");
        var scores = [];
        userUtils.getUsers(function(users) {
            users.forEach(function(u, i) {
                var score = 0;
                u.scores.forEach(function(s, q) {
                    score += s.value;
                });
                scores[i] = {
                    subid: u.subid,
                    nick: u.nickname,
                    score: score
                };
                //console.log(scores[i]);
            });
            callback(scores);
        });
    },
    generateLeaderboard: function(callback) {
        log.verbose("generateLeaderboard(" + typeof callback + ")");
        if (typeof callback == "function") {
            this.getScores(function(scores) {
                scores.sort(function(a, b) {
                    if (a.score > b.score) {
                        return -1;
                    }
                    if (a.score < b.score) {
                        return 1;
                    }
                    return 0;
                });
                callback(scores);
            });
        }
    }
};
