const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BadgeSchema = new Schema({
    id: {
        type: Number
    },
    name: {
        type: String,
        maxlength: 64
    },
    desc: {
        type: String,
        maxlength: 64
    },
    earn: {
        type: String,
        maxlength: 64
    },
    reward: {
        type: Number
    }
});

BadgeSchema.pre('save', function(next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    return next();
});

// Formatting
BadgeSchema.methods.object = () => {
	let self = this;
    return {
        id: self.id,
        name: self.name,
        desc: self.desc,
        earn: self.earn,
        reward: self.reward
    };
};
BadgeSchema.methods.toString = function() {
    return this.name.toString().trim();
};


let Badge = module.exports = mongoose.model('Badge', BadgeSchema);
module.exports.schema = BadgeSchema;

module.exports.getBadges = () => {
    return Badge.find({});
};

module.exports.getBadge = (id) => {
    return Badge.findOne({
        id: id
    });
};

module.exports.badgeExists = (id) => {
    return new Promise(function(done) {
        Badge.getBadge(id).then((badge) => {
            return done(badge !== undefined);
        }).catch(() => {
            return done(false);
        });
    });
};
