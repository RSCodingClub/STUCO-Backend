var request = require('request');
var googleUtils = require(global.DIR + '/googleutils');
var log = require('log-util');
var Utils = require(global.DIR + '/utils');
var User = require(global.DIR + '/models/user.model');

var events = [];
var eventMap = {};
var calendarTZ = "America/Chicago";

var Event = module.exports = function(evnt) {
    this.eid = "";
    var _ = {
        googleevent: {},
        eventtype: "",
        eventreward: "",
        kind: "calendar#event",
        etag: "",
        status: "",
        htmllink: "",
        created: "",
        updated: "",
        summary: "",
        description: "",
        location: "",
        colorid: "",
        creator: {
            id: "",
            email: "",
            displayName: "",
            self: false
        },
        organizer: {
            id: "",
            email: "",
            displayName: "",
            self: false
        },
        start: {
            date: "",
            dateTime: "",
            timeZone: ""
        },
        end: {
            date: "",
            dateTime: "",
            timeZone: ""
        },
        endtimeunspecified: false,
        recurrence: [""],
        recurringeventid: "",
        originalstarttime: {
            date: "",
            dateTime: "",
            timeZone: ""
        },
        transparency: "",
        visibility: "",
        icaluid: "",
        sequence: 0,
        attendees: [],
        attendeesomitted: false
    }

    // Constructor
    if (evnt) {
        // console.log(evnt.start.dateTime, " - ", evnt.end.dateTime);
        this.eid = evnt.id;
        _['googleevent'] = evnt;
        _['eventtype'] = "";
        _['eventreward'] = 0;
        _['kind'] = evnt.kind;
        _['etag'] = evnt.etag;
        _['status'] = evnt.status;
        _['htmllink'] = evnt.htmlLink;
        _['created'] = evnt.created;
        _['updated'] = evnt.updated;
        _['summary'] = evnt.summary;
        _['description'] = evnt.description;
        _['location'] = evnt.location;
        _['colorid'] = evnt.colorId;
        _['creator'] = evnt.creator;
        _['organizer'] = evnt.organizer;
        _['start'] = evnt.start;
        _['end'] = evnt.end;
        _['endtimeunspecified'] = evnt.endTimeUnspecified;
        _['recurrence'] = evnt.recurrence;
        _['recurringeventid'] = evnt.recurringEventId;
        _['originalstarttime'] = evnt.originalStartTime;
        _['transparency'] = evnt.transparency;
        _['visibility'] = evnt.visibility;
        _['icaluid'] = evnt.iCalUID;
        _['sequence'] = evnt.sequence;
        _['attendees'] = evnt.attendees ? evnt.attendees : [];
        _['attendeesomitted'] = evnt.attendeesOmitted;

        eventMap[evnt.id] = this;
        events.push(this);
    }
    this.object = function() {
        var r = _;
        r['eid'] = this.eid;
        r['id'] = this.eid;
        return r;
    };
    this.nice = function() {
        return {
            id: this.eid,
            summary: _['summary'],
            description: _['description'],
            eventtype: _['eventtype'],
            eventreward: _['eventreward'],
            start: _['start'],
            end: _['end'],
            location: _['location'],
            attendees: _['attendees'].length
        };
    };
    this.get = function(item) {
        return _[item.toString().toLowerCase().trim()];
    };
    this.set = function(item, value) {
        _[item.toString().toLowerCase().trim()] = value;
        return this;
    };
    this.onLocation = function(lat, lng, acc, callback) {
        return callback(undefined, true);
		// Utils.getLocationFromAddress(_['location'], function(err, location) {
        //     if (err) {
        //         return callback(err);
        //     } else {
        //         var dist = Utils.getDistance(location.lat, location.lng, lat, lng);
        //         if (dist + acc < global.ACCEPTABLE_RADIUS) {
        //             return callback(undefined, true);
        //         } else if (dist - acc < global.ACCEPTABLE_RADIUS) {
        //             return callback(undefined, true);
        //         } else {
        //             return callback(undefined, false);
        //         }
        //     }
        // });
    };

    // General checkin method
    // - Authenticate user token
    // - Valid Time
    // - Check for id in attendee list
    // - Valid location
    // - Add attendee
    // - Give user badge and reward
    this.checkin = function(subid, lat, lng, callback) {
        log.verbose("User().checkin(" + subid + ", " + lat + ", " + lng + ", " + typeof callback + ")")
        if (User.userExists(subid)) {
            var user = User.getUser(subid);

            // Within Timeframe including timezones
            var withinStart = new Date(_['start'].dateTime ? _['start'].dateTime : (_['start'].date + "T00:00:00" + Utils.getUTCOffsetString(_['start'].timeZone ? _['start'].timeZone : calendarTZ))).getTime() < Date.now();
            var withinEnd = new Date(_['end'].dateTime ? _['end'].dateTime : (_['end'].date + "T00:00:00" + Utils.getUTCOffsetString(_['end'].timeZone ? _['end'].timeZone : calendarTZ))).getTime() > Date.now();
            if (withinStart && withinEnd) {
                var attendees = _['attendees'] ? _['attendees'] : [];
                var checkedin = false;
                attendees.forEach(function(u, i) {
                    if (u.id == subid) {
                        checkedin = true;
                    }
                });
                if (!checkedin) {
                    this.onLocation(lat, lng, 50, function(err, onlocation) {
                        if (err) {
                            return callback(err);
                        } else {
                            if (onlocation) {
                                var attendee = {
                                    id: subid,
                                    email: user.getEmail(),
                                    displayName: user.getNickname(),
                                    responseStatus: "accepted"
                                };
								_['attendees'].push(attendee);
                                googleUtils.updateEvent(_['googleevent'].id, {
                                    start: _['start'],
                                    end: _['end'],
                                    attendees: _['attendees']
                                }, function(err, resp) {
									if (err) {
										console.log("splicing attendee");
										_['attendees'].splice(_['attendees'].length - 1, 1);
										return callback(err);
									} else {
										log.log(user.toString() + " checked into " + _['summary']);
										// TODO GIVE BADGE AND POINTS TO USER
										return callback(undefined, true);
									}
                                });
                            } else {
                                return callback(new Error("Not At Event Location"));
                            }
                        }
                    });
                } else {
                    return callback(new Error('Already Checked Into Event'));
                }
            } else {
                return callback(new Error("Not During Event Time"));
            }
        } else {
            return callback(new Error("User Not Found"));
        }
    };
};

var updateEvents = function(callback) {
    log.verbose("updateEvents(" + typeof callback + ")");
    googleUtils.getEvents({}, function(err, events) {
        if (err) {
			log.error(err.stack);
        } else {
            if (events.length > 0) {
                events.forEach(function(e, i) {
                    var evnt = new Event(e);
                    return callback();
                });
            }
        }
    });
};

updateEvents(function(err) {
    if (err) {
        log.error(err);
    }
});

if (global.ENV == 'developement') {
    setInterval(function() {
        updateEvents(function(err) {
            if (err) {
                log.error(err);
            }
        });
    }, 5 * 60 * 1000);
} else if (global.ENV == 'production') {
    setInterval(function() {
        var time = new Date().getHours(d.getHours() + (d.getMinutes() / 60));
        if (time === 14.5 || time === 0) {
            updateEvents(function(err) {
                if (err) {
                    log.error(err);
                }
            });
        }
    }, 30 * 1000);
} else {
    updateEvents(function(err) {
        if (err) {
            log.error(err);
        }
    });
}

module.exports.getEvents = function(eid) {
    return events;
};
module.exports.getEvent = function(eid) {
    return eventMap[eid];
};
module.exports.eventExists = function(eid) {
    return eventMap[eid] !== undefined;
};
