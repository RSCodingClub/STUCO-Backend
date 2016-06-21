var request = require('request');
var googleUtils = require(global.DIR + '/googleutils');
var log = require('log-util');
var Utils = require(global.DIR + '/utils');
var User = require(global.DIR + '/classes/user');

var events = [];
var eventMap = {};

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
	this.nice = function () {
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

    // this.addAttendee = function(subid, callback) {
    //     var URL = "https://www.googleapis.com/calendar/v3/calendars/" + global.CALENDAR_ID + "/events/" + this.eid + "?key=" + API_KEY;
    //     if (User.userExists(subid)) {
    //         var user = User.getUser(subid);
    //         request.put()
    //     } else {
    //         callback(new Error("User Not Found"));
    //     }
    // };
    this.onLocation = function(lat, lng, acc, callback) {
        Utils.getLocationFromAddress(_['location'], function(err, location) {
            if (err) {
                callback(err);
            } else {
                var dist = Utils.getDistance(location.lat, location.lng, lat, lng);
                if (dist + acc < global.ACCEPTABLE_RADIUS) {
                    callback(undefined, true);
                } else if (dist - acc < global.ACCEPTABLE_RADIUS) {
                    callback(undefined, true);
                } else {
                    callback(undefined, false);
                }
            }
        });
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
            if (new Date(_['start'].dateTime).getTime() < Date.now() && new Date(_['end'].dateTime).getTime() > Date.now()) {

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
                            callback(err);
                        } else {
                            if (onlocation) {
                                _['attendees'].push({
                                    id: subid,
                                    email: user.getEmail(),
                                    displayName: user.getNickname(),
                                    responseStatus: "accepted"
                                });
                                googleUtils.updateEvent(this.eid, {
                                    start: _['start'],
                                    end: _['end'],
                                    attendees: _['attendees']
                                }, function(err, resp) {
                                    console.log(user.toString() + " checked into " + _['summary']);
                                    // TODO GIVE BADGE AND POINTS TO USER
                                    // user.giveScore("event", _['eventreward'], this.eid);
                                    callback(undefined, "Good to go");
                                });
                            } else {
                                callback(new Error("Not At Event Location"));
                            }
                        }
                    });
                } else {
                    callback(new Error('Already Checked Into Event'));
                }
            } else {
                callback(new Error("Not During Event Time"));
            }
        } else {
            callback(new Error("User Not Found"));
        }
    };
};

(function() {
    var URL = "https://www.googleapis.com/calendar/v3/calendars/" + CALENDAR_ID + "/events?key=" + API_KEY;
    request.get(URL, function(err, res, body) {
        if (err) {
            callback(err);
        } else {
            var es = JSON.parse(body).items;
            es.forEach(function(e, i) {
                var evnt = new Event(e);
            });
        }
    });
})();

module.exports.getEvents = function(eid) {
    return events;
};
module.exports.getEvent = function(eid) {
    return eventMap[eid];
};
module.exports.eventExists = function(eid) {
    return eventMap[eid] !== undefined;
};
