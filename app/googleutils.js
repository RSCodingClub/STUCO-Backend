var google = require('googleapis');
var log = require('log-util');
var request = require('request');
var key = require(global.DIR + '/../private/authkey.json');
var calendar = google.calendar('v3');
var authClient = new google.auth.JWT(
    key.client_email,
	null,
    key.private_key,
    ['https://www.googleapis.com/auth/calendar']
	// "jmeyer023@rsdmo.org"
    // User to impersonate (leave empty if no impersonation needed)
    // 'subject-account-email@example.com'
);

module.exports.getEvents = function (options, callback) {
	log.verbose("getEvents(" + typeof callback + ")");
	authClient.authorize(function(err, tokens) {
	    if (err) {
	        callback(err);
	    } else {
			var params = {
		        auth: authClient,
				calendarId: global.CALENDAR_ID,
				singleEvents: true,
				orderBy: 'startTime'
		    };
			if (options.limit) {
				params.maxResults = options.limit;
			}
			calendar.events.list(params, function(err, resp) {
		        if (err) {
		            callback(err);
		        } else {
					log.info("Loaded " + resp.items.length + " events.");
					return callback(undefined, resp.items ? resp.items : []);
				}
		    });
		}
	});
};

module.exports.updateEvent = function (eid, eventDetails, callback) {

	// eventDetails
	/* {
		start: {dateTime: ""},
		end: {dateTime: ""},
		attendees: [{
			email: "",
			id: "subid",
			displayName: "",
			responseStatus: ""
		}]
	} */
	log.verbose("updateEvent("+eid + ", " + JSON.stringify(eventDetails).substring(0, 10) + "... , " + typeof callback +")");
	authClient.authorize(function(err, tokens) {
	    if (err) {
	        callback(err);
	    } else {
			var url = "https://www.googleapis.com/calendar/v3/calendars/"+ global.CALENDAR_ID +"/events/" + eid + "?key=" + global.API_KEY
			var params = {
				uri: url,
				headers: {
					"Authorization": "Bearer " + tokens.access_token
				},
				body: eventDetails,
				json: true
			};
			console.log("URL URL URL", url);
			request.put(params, function (err, resp, body) {
				log.debug(err, body);
				log.warn(require('util').inspect(params.body, {showHidden: false, depth: null}));
				return callback(err, resp);
			});

			 console.log(tokens);
			// calendar.events.update({
		    //     auth: authClient,
			// 	calendarId: global.CALENDAR_ID,
			// 	eventId: eid,
			// 	resource: eventDetails,
			// 	key: global.API_KEY
		    // }, function(err, resp) {
			// 	log.debug(err, resp)
		    //     if (err) {
		    //         callback(err);
		    //     } else {
			// 		return callback(undefined, resp);
			// 	}
		    // });
		}
	});
};
