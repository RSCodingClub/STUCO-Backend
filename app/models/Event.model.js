var validator = require('validator');
var Badge = require(global.DIR + '/classes/badge');
var Utils = require(global.DIR + '/utils');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var calendarTZ = "America/Chicago";

var EventSchema = new Schema({
    eid: {
        type: String,
        unique: true,
        require: true
    },
    summary: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 256
    },
    description: {
        type: String,
        default: "",
        maxlength: 1024
    },
    eventtype: {
        type: String,
        enum: ["football", "homecominggame", "homecomingdance", "baseball", "basketball", "softball", "tennis", "lacrosse", "artshow", "theater", "choir", "band", "orchestra", "fieldhokey", "hockey", "waterpolo", "swimming", "club", "peprally", "dollardance", "winterdance", "orientation", "icecreamsocial", "trunkortreat", "cocoandcramming", "other"]
    },
    location: {
        address: {
            type: String,
            default: "1780 Hawkins Rd, Fenton, MO 63026"
        },
        latitude: {
            type: Number,
            default: 38.51708
        },
        longitude: {
            type: Number,
            default: -90.49308
        }
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    attendees: {
        type: Array,
        default: []
    },
    created_at: {
        type: Date,
        default: new Date()
    }
});

EventSchema.pre('save', function(next) {
    this.updated_at = new Date();
    if (!this.created_at) {
        this.created_at = new Date();
    }
    return next();
});

// Formatting
EventSchema.methods.toString = function() {
    return this.summary.toString().trim();
};
EventSchema.methods.exportEvent = function() {
    return {
        eid: this.eid,
        eventtype: this.eventtype,
        summary: this.summary,
        description: this.description,
        start: this.start,
        end: this.end,
        location: this.location
    };
};

EventSchema.methods.userAttending = function(subid) {
    var r = false;
    this.attendees.forEach(function(attendee, i) {
        if (attendee.id === subid) {
            r = true;
        }
    });
    return r;
};

module.exports = Evnt = mongoose.model("Event", EventSchema);

module.exports.createEvent = function(a, callback) {
        Evnt.getEvent(a.eid, function(err, evnt) {
                if (evnt === undefined || evnt === null || evnt.length === 0) {
                    // Create Event
                    Utils.getLocationFromAddress(a.location, function(err, location) {
                        if (err) {
                            callback(err);
                        } else {
                            var r = {
                                eid: a.eid,
                                summary: a.summary,
                                description: a.descrption,
                                eventtype: a.type, // Possibly read from description
                                location: {
                                    address: a.location,
                                    latitude: location.lat,
                                    longitude: location.lng
                                }
                                start: new Date(_['start'].dateTime ? _['start'].dateTime : (_['start'].date + "T00:00:00" + Utils.getUTCOffsetString(_['start'].timeZone ? _['start'].timeZone : calendarTZ))),
                                end: new Date(_['end'].dateTime ? _['end'].dateTime : (_['end'].date + "T00:00:00" + Utils.getUTCOffsetString(_['end'].timeZone ? _['end'].timeZone : calendarTZ))),
                            };
                            var e = new Evnt(r);
                            return e.save(callback);
                        }
                    });
                } else {
                    return callback(new Error("Event Already Exists"));
                }
            };
        };

        module.exports.eventExists = function(subid, callback) {
            this.getEvent(subid, function(err, evnt) {
                if (err) {
                    return callback(false);
                } else {
                    return callback(evnt !== undefined);
                }
            });
        };

        module.exports.getEvent = function(eid, callback) {
            return Evnt.findOne({
                eid: eid
            }, callback);
        };

        module.exports.getEvents = function(callback) {
            return Evnt.find({}, callback);
        };

        module.exports.getActiveEvents = function(callback) {
            return Evnt.find({}).where('end').gt(new Date()).sort('+start').exec(callback);
        };
