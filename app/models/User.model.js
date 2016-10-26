const validator = require('validator');
const Badge = require(global.DIR + '/models/Badge.model');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
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
        default: 'student'
    },
    apikey: {
        type: String,
        default: function() {
            return require('crypto').randomBytes(24).toString('base64');
        }
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
        role: this.role,
		apikey: this.apikey
    };
};
UserSchema.methods.exportAll = function() {
    return this;
};


// Scores
UserSchema.methods.hasScore = function(t) {
    let r = false;
    this.scores.forEach(function(score) {
        if (score.timestamp.toString() === t.toString()) {
            r = true;
        }
    });
    return r;
};
UserSchema.methods.giveScore = function(options) {
    let self = this,
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
    // XXX: Fix this so it works
    return new Promise((done) => {
        // Badge for 50 points
        if (self.getScore() >= 50) {
            self.giveBadge(22).then(() => {
                // Badge for 100 points
                if (self.getScore() >= 100) {
                    self.giveBadge(29).then(() => {
                        return done();
                    });
                } else {
                    self.takeBadge(29);
                }
            });
        } else {
            self.takeBadge(22);
        }
    });
};
UserSchema.methods.removeScore = function(t) {
    let self = this,
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
    let total = 0;
    this.scores.forEach(function(score) {
        total += parseInt(score.value);
    });
    return total;
};

// Badges
UserSchema.methods.hasBadge = function(b) {
    let r = false;
    this.badges.forEach(function(o) {
        if (o.toString() === b.toString().trim()) {
            r = true;
        }
    });
    return r;
};
UserSchema.methods.giveBadge = function(b) {
    let self = this;
    return new Promise((done, reject) => {
        if (self.hasBadge(b)) {
            return reject(new Error('Failed to Give User Badge'));
        } else {
            Badge.badgeExists(b).then((exists) => {
                if (exists) {
                    self.badges.push(parseInt(b));
                    Badge.getBadge(b).then((badge) => {
                        self.giveScore({
                            type: 'badge',
                            value: badge.reward,
                            bid: b
                        }).then(() => {
                            return done();
                        });
                    }).catch((err) => {
                        return reject(err);
                    });
                } else {
                    reject(new Error('Badge Not Found'));
                }
            });
        }
    });
};
UserSchema.methods.takeBadge = function(b) {
    let self = this;
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

let User = module.exports = mongoose.model('User', UserSchema);

module.exports.schema = UserSchema;

module.exports.getUser = function(subid) {
    return User.findOne({
        subid: subid
    });
};

module.exports.userExists = (subid) => {
    return new Promise(function(done) {
        User.getUser(subid).then((user) => {
            return done(user !== undefined);
        }).catch(() => {
            return done(false);
        });
    });
};

module.exports.getUsers = function() {
    return User.find({});
};

module.exports.createUser = function(guser) {
    let user = new User({
        subid: guser.sub.toString().trim(),
        name: guser.name,
        nickname: guser.given_name,
        email: guser.email,
        role: 'student'
    });
    return new Promise((done, reject) => {
        user.giveBadge(0).then(() => {
            user.save().then((user) => {
                return done(user);
            }).catch((err) => {
                return reject(err);
            });
        }).catch((err) => {
            return reject(err);
        });
    });
};

module.exports.getLeaderboard = function() {
    let scores = [];
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
