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
    permissions: {
        type: Array,
        default: ["user.view.public", "bugreports.create"]
    }
});

UserSchema.pre('save', function(next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
        this.lastlogin = new Date();
    }

    next();
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
        permissions: this.permissions
    };
};


// Scores
UserSchema.methods.giveScore = function(options) {
	console.log("options", options);
    var score = {
        type: options.type,
        value: options.value,
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
    }
    // Badge for 100 points
    if (this.getScore() >= 100) {
        this.giveBadge(29);
    }
    return true;
};
UserSchema.methods.removeScore = function(t) {
    this.scores.forEach(function(score, i) {
        if (score.timestamp == t) {
            this.scores.splice(i, 1);
            return true;
        }
    });
    return false;
};
UserSchema.methods.getScore = function() {
    var total = 0;
    this.scores.forEach(function(score, i) {
        total += score.value;
    });
    return total;
};

// Badges
UserSchema.methods.hasBadge = function(b) {
    var r = false;
    this.badges.forEach(function(o, i) {
        if (o.toString() == b.toString().trim()) {
            r = true;
        }
    });
    return r;
};
UserSchema.methods.giveBadge = function(b) {
    if (typeof b == "number") {
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
    this.badges.forEach(function(o, i) {
        if (o == b) {
            this.badges.splice(i, 1);
            return true;
        }
    });
    return false;
};

// Permissions
UserSchema.methods.hasPermission = function(permission) {
    var userPerms = this.permissions;
    var matches = [permission];
    var permArray = permission.split(".");
    var r = false;
    permArray.forEach(function(p, i) {
        permArray[permArray.length - 1] = "*";
        matches.push(permArray.join("."));
        permArray.splice(permArray.length - 1, 1);
    });
    matches.push("*");
    matches.forEach(function(m, i) {
        userPerms.forEach(function(p, q) {
            if (m == p) {
                r = true;
            }
        });
    });
    return r;
};
UserSchema.methods.givePermission = function(permission) {
    if (this.hasPermission(permission)) {
        return false;
    } else {
        this.permissions.push(permission);
        return true;
    }
};
UserSchema.methods.removePermission = function(permission) {
    _permissions.forEach(function(p, i) {
        if (p == permission) {
            this.permissions.splice(i, 1);
            return true;
        }
    });
    return false;
};


module.exports = User = mongoose.model("User", UserSchema);

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
    User.findOne({
        subid: subid
    }, callback);
};

module.exports.getUsers = function(callback) {
    User.find({}, callback);
};

module.exports.createUser = function (guser, callback) {
	var user = new User({
		subid: guser.sub.toString().trim(),
		name: guser.name ? guser.name.toString() : (req.body.nickname ? req.body.nickname.toString().trim() : undefined),
		nickname: (guser.given_name ? guser.given_name.toString().trim() : (guser.name ? guser.name.toString() : undefined)),
		email: guser.email,
		permissions: ["bugreports.create", "user.view.public"]
	});
	user.giveBadge(0);
	user.save(function (err, dbUser) {
		if (err) {
			res.statusCode = 500;
			var e = new Error("Failed to Create User");
			callback(e);
		} else {
			log.info("Welcome " + dbUser.nickname);
			callback(undefined, dbUser);
		}
	});
};

module.exports.getLeaderboard = function(callback) {
    var scores = [];
    this.getUsers(function(err, users) {
        if (err) {
            callback(err);
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
            callback(undefined, scores);
        }
    });
};
