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
        default: ''
    },
    nickname: {
        type: String,
        maxlength: 36,
        default: ''
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
        enum: ['student', 'tester', 'teacher', 'stuco', 'developer', 'admin'],
        default: ['student']
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
    };
};
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
UserSchema.methods.hasScore = function(t) {
    var r = false;
    this.scores.forEach(function(score) {
        if (score.timestamp.toString() === t.toString()) {
            r = true;
        }
    });
    return r;
};
UserSchema.methods.giveScore = function(options) {
    var self = this,
        timestamp = ((options.timestamp ? options.timestamp : Date.now()).toString()),
        score = {
            type: options.type.toString().trim(),
            value: isNaN(Number(options.value)) ? 0 : parseInt(options.value),
            timestamp: self.hasScore(timestamp) ? timestamp + 1 : timestamp
        };
    if (options.eid) {
        score.eid = options.eid;
    }
    if (options.bid !== undefined) {
        score.bid = options.bid;
    }
    self.scores.push(score);
    // Badge for 50 points
    if (self.getScore() >= 50) {
        self.giveBadge(22);
        // Badge for 100 points
        if (self.getScore() >= 100) {
            self.giveBadge(29);
        } else {
            self.takeBadge(29);
        }
    } else {
        self.takeBadge(22);
    }
    return true;
};
UserSchema.methods.removeScore = function(t) {
    var self = this,
        r = false;
    this.scores.forEach(function(score, i) {
        if (score.timestamp.toString() === t.toString()) {
            self.scores.splice(i, 1);

            if (self.getScore() <= 50) {
                self.takeBadge(22);
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
    this.scores.forEach(function(score) {
        total += parseInt(score.value);
    });
    return total;
};

// Badges
UserSchema.methods.hasBadge = function(b) {
    var r = false;
    this.badges.forEach(function(o) {
        if (o.toString() === b.toString().trim()) {
            r = true;
        }
    });
    return r;
};
UserSchema.methods.giveBadge = function(b) {
    var self = this;
    if (typeof b === 'number') {
        if (self.hasBadge(b)) {
            return false;
        } else {
            self.badges.push(parseInt(b));
            var badge = Badge.getBadge(b);
            self.giveScore({
                type: 'badge',
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
    var self = this;
    this.badges.forEach(function(o, i) {
        if (o === b) {
            self.badges.splice(i, 1);
            self.scores.forEach(function(s) {
                if (s.bid === b) {
                    self.removeScore(s.timestamp);
                }
            });
            return true;
        }
    });
    return false;
};

let User = mongoose.model('User', UserSchema);
module.exports = User;

module.exports.schema = UserSchema;

module.exports.userExists = function(subid) {
    return new Promise(function(done) {
        this.getUser(subid, function(err, user) {
            if (err) {
                done(false);
            } else {
                done(user !== null);
            }
        });
    });
};

module.exports.getUser = function(subid) {
    return User.findOne({
        subid: subid
    });
};

module.exports.getUsers = function() {
    return User.find({});
};

module.exports.createUser = function(guser) {
    var user = new User({
        subid: guser.sub.toString().trim(),
        name: guser.name,
        nickname: guser.given_name,
        email: guser.email,
        role: 'student'
    });
    user.giveBadge(0);
    return user.save();
};

module.exports.getLeaderboard = function() {
    var scores = [];
    return new Promise((done, reject) => {
        this.getUsers().then((users) => {
            if (users.length > 0) {
                users.forEach(function(u) {
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
            done(scores);
        }).catch(reject);
    });
};
