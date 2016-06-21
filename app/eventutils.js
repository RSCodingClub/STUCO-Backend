var request = require('request');
var log = require('log-util');
var Utils = require(global.DIR + '/utils');
var userUtils = require(global.DIR + '/userutils');
var scoreUtils = require(global.DIR + '/scoreutils');
var badgeUtils = require(global.DIR + '/badgeutils');
var User = require(global.DIR + '/classes/user');
var Badge = require(global.DIR + '/classes/badge');

var ACCEPTABLE_RADIUS = 400;

var eventUtils = module.exports = {
    eventTypes: ["basketball", "soccer", "football", "theatre", "band", "homecoming", "peprally"],
    // getEventCalendar: function(callback) {
    //     log.verbose("getEventCalendar(" + typeof callback + ")");
    //     var API_KEY = "AIzaSyDQhrNxeNTp-uONV9fUuElCylSQF2MHMtI",
    //         CALENDAR_ID = "d7qc2o4as3tspi1k9617pdjvho@group.calendar.google.com", //"rsdmo.org_39313733373631393232@resource.calendar.google.com",
    //         URL = "https://www.googleapis.com/calendar/v3/calendars/" + CALENDAR_ID + "/events?key=" + API_KEY;
    //     request.get(URL, function(err, res, body) {
    //         if (err) {
    //             callback(err);
    //         } else {
    //             var data = JSON.parse(body);
    //             callback(undefined, data);
    //         }
    //     });
    // },
    // getEvents: function(callback) {
    //     log.verbose("getEvents(" + typeof callback + ")");
    //     this.getEventCalendar(function(err, data) {
    //         if (err) {
    //             callback(err);
    //         } else {
    //             data.items.forEach(function(e, i) {
    //                 e.score = Math.round(Math.random() * 10); // TEMP BADGE AND SCORE HOLDERS
    //                 e.badge = 2; // TEMP BADGE AND SCORE HOLDERS
    //                 e.type = eventUtils.eventTypes[Math.round(Math.random() * eventUtils.eventTypes.length)];
    //                 data.items[i] = e;
    //             });
    //             callback(undefined, data.items);
    //         }
    //     });
    // },
    // getEvent: function(eid, callback) {
    //     log.verbose("getEvents(" + eid + ", " + typeof callback + ")");
    //     this.getEvents(function(err, events) {
    //         if (err) {
    //             callback(err);
    //         } else {
    //             var r = undefined;
    //             events.forEach(function(e, i) {
    //                 if (e.id == eid) {
    //                     r = e;
    //                 }
    //             });
    //             if (r == undefined) {
    //                 callback(new Error("Event Not Found"));
    //             } else {
    //                 callback(undefined, r);
    //             }
    //         }
    //     });
    // },
    // atEvent: function(eid, lat, lng, acc, callback) {
    //     log.verbose("atEvent(" + eid + ", " + lat + ", " + lng + ", " + acc + ", " + typeof callback + ")");
    //     if (acc > 50) {
    //         acc = 50;
    //     }
    //     if (typeof callback == "function") {
    //         this.getEvent(eid, function(err, eventdata) {
    //             if (err) {
    //                 callback(err);
    //             } else {
    //                 var start = new Date(eventdata.start.dateTime).getTime();
    //                 var end = new Date(eventdata.end.dateTime).getTime();
	//
    //                 if (start < Date.now() && end > Date.now()) {
    //                     var address = eventdata.location;
    //                     Utils.getLocationFromAddress(address, function(err, location) {
    //                         if (err) {
    //                             callback(err);
    //                         } else {
    //                             var dist = Utils.getDistance(location.lat, location.lng, lat, lng);
    //                             if (dist + acc < ACCEPTABLE_RADIUS) {
    //                                 callback(undefined, true);
    //                             } else if (dist - acc < ACCEPTABLE_RADIUS) {
    //                                 callback(undefined, true);
    //                             } else {
    //                                 callback(undefined, false);
    //                             }
    //                         }
    //                     });
    //                 } else {
    //                     callback(new Error("Not On Time to Event"));
    //                 }
    //             }
    //         });
    //     } else {
    //         log.error("Incorrect Callback Type");
    //     }
    // },
    // already: function(subid, eid) {
    //     log.verbose("already(" + subid + ", " + eid + ")");
    //     if (userUtils.userExistsSync(subid)) {
    //         var user = userUtils.getUserSync(subid);
    //         var already = false;
    //         user.scores.forEach(function(s, i) {
    //             if (s.eid == eid) {
    //                 already = true;
    //             }
    //         });
    //         return already;
    //     } else {
    //         return false;
    //     }
    // },
    // checkin: function(subid, eid, callback) {
    //     log.verbose("checkin(" + subid + ", " + eid + ", " + typeof callback + ")");
    //     if (this.already(subid, eid)) {
    //         callback(new Error("Cannot Checkin To The Same Event"));
    //     } else {
    //         this.getEvent(eid, function(err, eventdetails) {
    //             scoreUtils.givePointsSync(subid, "event", eventdetails.score, eid);
    //             badgeUtils.giveBadge(subid, eventdetails.badge, function(err, user) {
    //                 if (err) {
    //                     callback(err);
    //                 } else {
    //                     // Badge for attending an event
	// 					callback(undefined, User.getUser(subid.toString().trim()).giveBadge(1));
    //                 }
    //             });
    //         });
    //     }
    // }
};
