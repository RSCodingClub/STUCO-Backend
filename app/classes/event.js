const googleUtils = require(global.DIR + '/googleutils');
const log = require('log-util');
const Utils = require(global.DIR + '/utils');
const moment = require('moment-timezone');

var events = [];
var eventMap = {};
var calendarTZ = 'America/Chicago';

var Event = module.exports = function(evnt) {
    this.eid = '';
    var _ = {
        googleevent: {},
        eventtype: '',
        eventreward: '',
        kind: 'calendar#event',
        etag: '',
        status: '',
        htmllink: '',
        created: '',
        updated: '',
        summary: '',
        description: '',
        location: '',
        colorid: '',
        creator: {
            id: '',
            email: '',
            displayName: '',
            self: false
        },
        organizer: {
            id: '',
            email: '',
            displayName: '',
            self: false
        },
        start: {
            date: '',
            dateTime: '',
            timeZone: ''
        },
        end: {
            date: '',
            dateTime: '',
            timeZone: ''
        },
        endtimeunspecified: false,
        recurrence: [''],
        recurringeventid: '',
        originalstarttime: {
            date: '',
            dateTime: '',
            timeZone: ''
        },
        transparency: '',
        visibility: '',
        icaluid: '',
        sequence: 0,
        attendees: [],
        attendeesomitted: false
    };

    // Constructor
    if (evnt) {
        // console.log(evnt.start.dateTime, " - ", evnt.end.dateTime);
        this.eid = evnt.id;
        _['googleevent'] = evnt;
        _['eventtype'] = '';
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
    this.isAttending = (user) => {
        var checkedin = false;
        var attendees = _['attendees'] ? _['attendees'] : [];
        attendees.forEach(function(u) {
            if (u.id == user.subid) {
                checkedin = true;
            }
        });
        return checkedin;
    };
    this.onLocation = function(lat, lng, acc) {
        // NOTE: The following line temporarily disables location testing
        // return new Promise((done) => {return done();});
        return new Promise((done, reject) => {
            Utils.getLocationFromAddress(_['location']).then((location) => {
                var dist = Utils.getDistance(location.lat, location.lng, lat, lng);
                if (dist + acc < global.ACCEPTABLE_RADIUS) {
                    return done(true);
                } else if (dist - acc < global.ACCEPTABLE_RADIUS) {
                    return done(true);
                } else {
                    return done(false);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    };

    // General checkin method
    // - Valid Time
    // - Check for id in attendee list
    // - Valid location
    // - Add attendee
    // - Give user badge and reward
    this.checkin = function(user, lat, lng) {
        log.verbose('User().checkin(' + user.subid + ', ' + lat + ', ' + lng + ', ' + typeof callback + ')');
        return new Promise((done, reject) => {
            // Within Timeframe including timezones
            console.log('test', _['start'].timeZone || calendarTZ);

            let startTime = new Date(moment(_['start'].dateTime || _['start'].date).tz(_['start'].timeZone || calendarTZ).format()); // new Date(moment.tz(new Date(_['start'].dateTime || _['start'].date), _['start'].timeZone || calendarTZ).format());
            let endTime = new Date(moment(_['end'].dateTime || _['end'].date).tz(_['end'].timeZone || calendarTZ).format());
            console.log('startTime', startTime, startTime.getTime() < Date.now());
            console.log('endTime', endTime, endTime.getTime() > Date.now());
            console.log('Date.str()', startTime);
            console.log('Date.now()', new Date(moment().format()));
            console.log('Date.end()', endTime);
            console.log('Range', endTime.getTime() - startTime.getTime());
            if (startTime.getTime() < Date.now() && endTime.getTime() > Date.now()) {
                if (this.isAttending(user)) {
                    return reject(new Error('Already Checked Into Event'));
                }
                console.log(lat, lng);
                this.onLocation(lat, lng, 50).then((onlocation) => {
                    if (!onlocation) return reject(new Error('Not At Event Location'));
                    // _['attendees'].push({
                    //     id: user.subid,
                    //     email: user.email,
                    //     displayName: user.nickname,
                    //     responseStatus: 'accepted'
                    // });
                    googleUtils.addAttendee(_['googleevent'].id, user).then((data) => {
                        console.log('data', data);
                        return done();
                    }).catch(() => {
                        return reject(new Error('Failed to Update Event'));
                    });
                    // googleUtils.updateEvent(_['googleevent'].id, {
                    //     start: _['start'],
                    //     end: _['end'],
                    //     attendees: _['attendees']
                    // }, function(err) {
                    //     if (err) {
                    //         _['attendees'].splice(_['attendees'].length - 1, 1);
                    //         return reject(err);
                    //     }
                    //     log.log(user.toString() + ' checked into ' + _['summary']);
                    //     // TODO GIVE BADGE AND POINTS TO USER
                    //     return done(true);
                    // });
                }).catch((err) => {
                    return reject(err);
                });


            } else {
                return reject(new Error('Not During Event Time'));
            }
        });
    };
};

var updateEvents = function() {
    log.verbose('updateEvents()');
    return new Promise((done, reject) => {
        googleUtils.getEvents({}).then((newEvents) => {
            events = [];
            eventMap = {};
            newEvents.forEach(function(e) {
                new Event(e);
            });
            log.info('Loaded ' + events.length + ' events.');
            return done();
        }).catch((err) => {
            console.log('errr', err);
            return reject(err);
        });
    });
};

updateEvents().catch((err) => {
    log.error(err);
});

if (global.ENV == 'developement') {
    setInterval(function() {
        updateEvents().catch((err) => {
            log.error(err);
        });
    }, 5 * 60 * 1000);
} else if (global.ENV == 'production') {
    setInterval(function() {
        updateEvents().catch((err) => {
            log.error(err);
        });
    }, 30 * 60 * 1000);
} else {
    updateEvents().catch((err) => {
        log.error(err);
    });
}

module.exports.getEvents = function() {
    return events;
};
module.exports.getEvent = function(eid) {
    return eventMap[eid];
};
module.exports.eventExists = function(eid) {
    return eventMap[eid] !== undefined;
};
