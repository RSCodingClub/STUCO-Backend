var request = require('request');
var log = require('log-util');

module.exports = {
    getEventCalendar: function(callback) {
        var API_KEY = "AIzaSyDQhrNxeNTp-uONV9fUuElCylSQF2MHMtI",
            CALENDAR_ID = "g24kdq1c97jstjlca8v6sb23j4@group.calendar.google.com",
            URL = "https://www.googleapis.com/calendar/v3/calendars/" + CALENDAR_ID + "/events?key=" + API_KEY;
        request.get(URL, function(err, res, body) {
            if (err) {
                callback(err);
            } else {
                var data = JSON.parse(body);
                callback(undefined, data);
            }
        });
    },
    getEvents: function(callback) {
        this.getEventCalendar(function(err, data) {
            if (err) {
                callback(err);
            } else {
                callback(undefined, data.items);
            }
        });
    },
    getEvent: function(eid, callback) {
        this.getEvents(function(err, events) {
            if (err) {
                callback(err);
            } else {
                var r = undefined;
                events.forEach(function(e, i) {
                    if (e.id == eid) {
                        r = e;
                    }
                });
                if (r == undefined) {
                    callback(new Error("Event Not Found"));
                } else {
                    callback(undefined, r);
                }
            }
        });
    },
    atEvent: function(eid, lat, lng, callback) {
        this.getEvent(eid, function(err, eventdata) {
            if (err) {
                res.statusCode = 400;
                callback(err);
            } else {
                var start = new Date(eventdata.start.dateTime).getTime();
                var end = new Date(eventdata.end.dateTime).getTime();

                if (start < Date.now() && end > Date.now()) {
                    var address = eventdata.location;
                    utils.getLocationFromAddress(address, function(err, location) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log("Location", location.lat + ", " + location.lng);
                            var dist = utils.getDistance(location.lat, location.lng, req.body.latitiude, req.body.longitude);
                            if (dist + req.body.accuracy < ACCEPTABLE_RADIUS) {
                                callback(undefined, true);
                            } else if (dist - req.body.accuracy < ACCEPTABLE_RADIUS) {
                                callback(undefined, true);
                            } else {
                                callback(undefined, false);
                            }
                        }
                    });
                } else {
                    callback(new Error("Timeframe Error, Not On Time"));
                }
            }
        });
    }
};
