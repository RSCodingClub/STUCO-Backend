var userUtils = require(__dirname + "/userutils");

module.exports = {
    givePoints: function(gid, type, value, callback) {
        console.log("GIVE POINTS (" + gid + "): " + value + " [" + type + "]");
        userUtils.getUserAsync(gid, function(user) {
            user.scores.push({
                type: type,
                value: value,
                timestamp: Date.now()
            });
            userUtils.setUser(user, callback);
        });
    },
    getScore: function(gid) {
        var score = 0;
        userUtils.getUser(gid).scores.forEach(function(s, i) {
            score += s.value;
        });
        return score;
    },
    getScoreAsync: function(gid, callback) {
        var score = 0;
        userUtils.getUserAsync(gid, function(user) {
            user.scores.forEach(function(s, i) {
                score += s.value;
            });
            callback(score);
        });
    },
    getScores: function(callback) {
        var scores = [];
        userUtils.getUsersAsync(function(users) {
            users.forEach(function(u, i) {
                var score = 0;
                u.scores.forEach(function(s, q) {
                    score += s.value;
                });
                scores[i] = {
                    gid: u.gid,
					nick: u.nickname,
					name: u.name,
                    score: score
                };
				//console.log(scores[i]);
            });
			callback(scores);
        });
    },
    generateLeaderboard: function functionName(callback) {
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
				console.log(scores[0].name, scores[1].name);
				callback(scores);
	        });
		}
    }
};
