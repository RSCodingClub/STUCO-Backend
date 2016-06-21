var google = require('googleapis');
var fs = require('fs');
var log = require('log-util');
var calendar = google.calendar('v3');
var authClient = new google.auth.JWT(
    'stucoserver@serene-utility-126519.iam.gserviceaccount.com',
    // 'path/to/key.pem',
    // Contents of private_key.pem if you want to load the pem file yourself
    // (do not use the path parameter above if using this param)
    JSON.parse(fs.readFileSync(global.DIR + '/../private/authkey.json')).private_key,
    // Scopes can be specified either as an array or as a single, space-delimited string
	null,
    ['https://www.googleapis.com/auth/calendar']
    // User to impersonate (leave empty if no impersonation needed)
    // 'subject-account-email@example.com'
);

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
			calendar.event.update({
		        auth: authClient,
				calendarId: global.CALENDAR_ID,
				eventId: eid,
				resource: eventDetails,
		    }, function(err, resp) {
		        if (err) {
		            callback(err);
		        } else {
					callback(undefined, resp);
				}
		    });
		}
	});
};
