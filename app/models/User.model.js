var validator = require('validator');
var Badge = require(global.DIR + '/classes/badge');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    subid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        maxlength: 48,
        default: ""
    },
    nickname: {
        type: String,
        maxlength: 36,
        default: ""
    },
    email: {
        type: String,
        required: true,
        validate: function(v) {
            return validator.isEmail(v);
        },
        unique: true
    },
    scores: {
        type: Array,
        default: []
    },
    badges: {
        type: Array,
        default: []
    },
    role: {
        type: String,
        enum: ["student", "tester", "teacher", "stuco", "developer", "admin"],
        default: ["student"]
    }
});

UserSchema.pre('save', function(next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
        this.lastlogin = new Date();
    }
    return next();
});

// Formatting
UserSchema.methods.toString = function() {
    return this.nickname.toString().trim();
};
UserSchema.methods.getPublicUser = function() {
    return {
        subid: this.subid,
        name: this.name,
        nickname: this.nickname,
        score: this.getScore(),
        badges: this.badges
    }
}
UserSchema.methods.exportUser = function() {
    return {
        subid: this.subid,
        name: this.name,
        nickname: this.nickname,
        email: this.email,
        scores: this.scores,
        badges: this.badges,
        role: this.role
    };
};
UserSchema.methods.exportAll = function() {
    return this;
};


// Scores
UserSchema.methods.giveScore = function(options) {
    // Delay to stop scores from hhaving identical timestamps
    setTimeout(function() {
        var score = {
            type: options.type.toString().trim(),
            value: isNaN(Number(options.value)) ? 0 : parseInt(options.value),
            timestamp: options.timestamp ? options.timestamp : Date.now()
        };
        if (options.eid) {
            score.eid = options.eid;
        }
        if (options.bid !== undefined) {
            score.bid = options.bid;
        }
        this.scores.push(score);
        // Badge for 50 points
        if (this.getScore() >= 50) {
            this.giveBadge(22);
        } else {
            this.takeBadge(22);
        }
        // Badge for 100 points
        if (this.getScore() >= 100) {
            this.giveBadge(29);
        } else {
            this.takeBadge(29);
        }
        return true;
    }, Math.round(Math.rand() * 10));
};
UserSchema.methods.removeScore = function(t) {
    console.log("REMOVE SCORE");
    var self = this,
        r = false;
    this.scores.forEach(function(score, i) {
        console.log("SCORE[" + i + "] = " + score.timestamp, (score.timestamp === t));
        console.log('typeof t = ' + typeof t, 'typeof score.timestamp = ' + typeof score.timestamp);
        if (score.timestamp == t) {
            console.log("EQUALS");
            self.scores.splice(i, 1);

            if (self.getScore() <= 50) {
                self.takeBadge(22)
            }
            if (self.getScore() <= 100) {
                self.takeBadge(29);
            }

            r = true;
        }
    });
    return r;
};
UserSchema.methods.getScore = function() {
    var total = 0;
    this.scores.forEach(function(score, i) {
        total += parseInt(score.value);
    });
    return total;
};

// Badges
UserSchema.methods.hasBadge = function(b) {
    var r = false;
    this.badges.forEach(function(o, i) {
        if (o.toString() === b.toString().trim()) {
            r = true;
        }
    });
    return r;
};
UserSchema.methods.giveBadge = function(b) {
    if (typeof b === "number") {
        if (this.hasBadge(b)) {
            return false;
        } else {
            this.badges.push(parseInt(b));
            var badge = Badge.getBadge(b);
            this.giveScore({
                type: "badge",
                value: badge.getReward(),
                bid: b
            });
            return true;
        }
    } else {
        return false;
    }
};
UserSchema.methods.takeBadge = function(b) {
    // TODO: Remove scores that badges grant
    var self = this;
    this.badges.forEach(function(o, i) {
        if (o === b) {
            self.badges.splice(i, 1);
            return true;
        }
    });
    return false;
};

module.exports = User = mongoose.model("User", UserSchema);
module.exports.schema = UserSchema;

module.exports.userExists = function(subid, callback) {
    this.getUser(subid, function(err, user) {
        if (err) {
            return callback(false);
        } else {
            return callback(user !== null);
        }
    });
};

module.exports.getUser = function(subid, callback) {
    return User.findOne({
        subid: subid
    }, callback);
};

module.exports.getUsers = function(callback) {
    return User.find({}, callback);
};

module.exports.createUser = function(guser, callback) {
    var user = new User({
        subid: guser.sub.toString().trim(),
        name: guser.name,
        nickname: guser.given_name,
        email: guser.email,
        role: "student"
    });
    user.giveBadge(0);
    user.save(function(err, dbUser) {
        if (err) {
            res.statusCode = 500;
            var e = new Error("Failed to Create User");
            return callback(e);
        } else {
            log.info("Welcome " + dbUser.nickname);
            return callback(undefined, dbUser);
        }
    });
};

module.exports.getLeaderboard = function(callback) {
    var scores = [];
    this.getUsers(function(err, users) {
        if (err) {
            return callback(err);
        } else {
            if (users.length > 0) {
                users.forEach(function(u, i) {
                    scores.push(u.getPublicUser());
                });
                scores.sort(function(a, b) {
                    if (a.score > b.score) {
                        return -1;
                    }
                    if (a.score < b.score) {
                        return 1;
                    }
                    return 0;
                });
            }
            return callback(undefined, scores);
        }
    });
};
