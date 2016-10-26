var google = require('googleapis');
var log = require('log-util');
// var request = require('request');
var key = require(global.DIR + '/../private/authkey.json');
var calendar = google.calendar('v3');

let oauth2 = new google.auth.OAuth2('104785267397578482022', global.CONFIG['google-oauth']['secret'], 'https://itotallyrock.cf/googleauth');
var authClient = new google.auth.JWT(
    key.client_email,
    key,
    key.private_key, ['https://www.googleapis.com/auth/calendar']
    // "jmeyer023@rsdmo.org"
    // User to impersonate (leave empty if no impersonation needed)
    // 'subject-account-email@example.com'
);

module.exports.getEvents = function(options) {
    log.verbose('getEvents(' + options + ')');
    return new Promise((done, reject) => {
        authClient.authorize(function(err, tokens) {
            if (err) return reject(err);
			oauth2.setCredentials({
                access_token: tokens.access_token
            });
            calendar.events.list({
                auth: oauth2,
				key: global.CONFIG['api-key'],
                calendarId: global.CALENDAR_ID,
                singleEvents: true,
                orderBy: 'starttime',
				maxResults: options.limit || 16
            }, function(err, resp) {
                if (err) return reject(err);
				console.log(resp.items.length);
                return done(resp.items || []);
            });
        });
    });
};

module.exports.addAttendee = (eid, user) => {
    return new Promise((done, reject) => {
        authClient.authorize(function(err, tokens) {
            if (err) return reject(err);
            oauth2.setCredentials({
                access_token: tokens.access_token
            });
            calendar.events.patch({
                auth: oauth2,
                calendarId: global.CONFIG['calendar-id'],
                eventId: eid,
                key: global.CONFIG['api-key'],
                resource: {
                    attendees: [{
                        email: user.email,
                        id: user.subid,
                        displayName: user.name,
                        responseStatus: 'accepted'
                    }]
                }
            }, function(err, resp) {
				log.error(err, err.message);
				log.info('user', JSON.stringify(oauth2));
                if (err) return reject(err);
                return done(resp);
            });
        });
    });
};

module.exports.updateEvent = function(eid, eventDetails) {

    // eventDetails
    /* {
    	start: {dateTime: ""},
    	end: {dateTime: ""},
    	attendees: [{
    		email: "name@rsdmo.org",
    		id: "subid",
    		displayName: "Name",
    		responseStatus: "accepted"
    	}]
    } */
    log.verbose('updateEvent(' + eid + ', ' + JSON.stringify(eventDetails).substring(0, 10) + '... , ' + typeof callback + ')');

    // var url = 'https://www.googleapis.com/calendar/v3/calendars/' + global.CALENDAR_ID + '/events/' + eid + '?key=' + global.API_KEY;
    // var params = {
    //     uri: url,
    //     headers: {
    //         'Authorization': 'Bearer ' + tokens.access_token
    //     },
    //     body: eventDetails,
    //     json: true
    // };
    // //console.log("URL URL URL", url);
    // request.put(params, function(err, resp, body) {
    //     log.debug(err, body);
    //     //log.warn(require('util').inspect(params.body, {showHidden: false, depth: null}));
    //     return callback(err, resp);
    // });
    // calendar.events.update({
    //     auth: authClient,
    //     calendarId: global.CALENDAR_ID,
    //     eventId: eid,
    //     resource: eventDetails,
    //     key: global.API_KEY
    // }, function(err, resp) {
    //     log.debug(err, resp);
    //     if (err) {
    //         return callback(err);
    //     } else {
    //         return callback(undefined, resp);
    //     }
    // });
};
