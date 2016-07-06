var validator = require('validator');
var Badge = require(global.DIR + '/classes/badge');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BadgeSchema = new Schema({
    bid: {
        type: Number
    },
    name: {
        type: String,
        maxlength: 64
    }
    desc: {
        type: String,
        maxlength: 64
    }
    earn: {
        type: String,
        maxlength: 64
    }
    reward: {
        type: Number
    }
});

BadgeSchema.pre('save', function(next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});

// Formatting
BadgeSchema.methods.toString = function() {
    return this.name.toString().trim();
};


module.exports = Badge = mongoose.model("Badge", BadgeSchema);
module.exports.schema = BadgeSchema;

module.exports.getBadges = function (callback) {
	Badge.find({}, function (err, badges) {
		return callback(err, badges);
	});
}
