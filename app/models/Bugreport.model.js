var validator = require('validator');
var Badge = require(global.DIR + '/classes/badge');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require(global.DIR + '/models/user.model');

var BugreportSchema = new Schema({
    submitter: User,
    closed: {
        type: Boolean,
        default: false
    }
    bugtype: {
        type: String,
        enum: ["crash", "ui", "event", "other"]
    },
    summary: {
        type: String,
        maxlength: 512
    },
    description: {
        type: String,
        minlength: 16,
        maxlength: 4096
    },
    syslogs: {
        type: String
    },
    applogs: {
        type: String
    }
});

BugreportSchema.pre('save', function(next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    next();
});

// Formatting
BugreportSchema.methods.toString = function() {
    return this.summary.toString().trim();
};

module.exports = Bugreport = mongoose.model("Bugreport", BugreportSchema);

module.exports.getBugreportsByUser = function(subid, callback) {
    Bugreport.find({}).where("submitter.subid").equals(subid).execute(callback);
};

module.exports.getBugreports = function(callback) {
    Bugreport.find({}, callback);
};
