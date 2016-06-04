var log = require('log-util');
var userUtils = require(__dirname + '/userutils');

module.exports = function(app) {
	var PORT = process.env.PORT | 3000;
	userUtils.initUsers(function(err, users) {
	    if (err) {
	        log.error(err.stack);
	        process.exit(169);
	    } else {
	        setInterval(function() {
	            userUtils.updateUsers(function(err, users) {
	                if (err) {
	                    log.error(err.stack);
	                    process.exit(169);
	                }
	            });
	        }, 1000);
	        log.info("Storing Data for " + userUtils.getUsersSync().length + " users");

	        app.listen(PORT, function() {
				var badgeRoute = require(__dirname + "/routes/api/badge")(app),
					userRoute = require(__dirname + "/routes/api/user")(app),
					eventRoute = require(__dirname + "/routes/api/event")(app),
					mainRoute = require(__dirname + "/routes/routes")(app)
				log.info('App listening on port ' + PORT);

				userUtils.backupUsers(function(err) {
					if (err)
						log.error("FATAL FAILED TO SAVE USER BACKUP", err)
				});
	        });
	    }
	});
};

// userUtils.verifyToken("eyJhbGciOiJSUzI1NiIsImtpZCI6IjI5YzVlMmIzYThjMTQyOWQ3MzA0M2EyNzJkMGVkMWRjYTQ1NjJjYTYifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhdWQiOiI5Njc3MjMzMDk2MzItYW01b2FrOTdxazhuNmZzdTFrYWdlb3B2NGJlOXRqNXUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDAwMzM3NTg1MzM4MzAyODYzNDgiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiOTY3NzIzMzA5NjMyLWQ2dDRvNGhwOGhnaXU0NXNvbTlsMGVqZTEyMnI5bGM4LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJkb25ueXdlZWszQGdtYWlsLmNvbSIsImlhdCI6MTQ2NDc1NDU5MCwiZXhwIjoxNDY0NzU4MTkwLCJuYW1lIjoiRG9ubnkgU2hhdyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vLVVVbm5PXzFfYjhFL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUl3L05jTGE3Q0NHeE80L3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJEb25ueSIsImZhbWlseV9uYW1lIjoiU2hhdyIsImxvY2FsZSI6ImVuIn0.B159kZA2PxidKmRhj7DclpiRN_2AvjZrn1CNa_8uQ5fiet3f1k2OZaJstA1Mjf-GBh5iXhRagZ6rkX1OcZ9m9TDyEtZvv-xgYF-ilQkgjZqo1P7ucAJ1SB-n8vFnAF5gsq5GQOIP7owS1JoIuyVhCZUBksMB0FtuhxI8aoYsB5ftV1VyjJ-EmY_rpmqCQIw-K9Ez9q9k5WSrcifjUGuoJFrA96bTlZylF1KXEv4TffDUCr4FsDxiPowefi2AAAPLtLDnHzll7a8sI45Q-QoPRASe6hpQZygpXlZwmUJYx0qsboy6-prSW66DFJMUErALqIrB1HuwJBX91uVPxZrp0g", function(err, user) {
//     if (err) {
//         log.error(err);
//     } else {
//         log.debug(user);
//     }
// });
//userUtils.createUser("823899009282884900098", "JEFFREY MEYER", "Jeffrey");
//console.log(userUtils.userExists("100033758533830286348"));
// badgeUtils.giveBadge("100033758533830286348", 1);
// badgeUtils.giveBadge("100033758533830286348", 2);
// badgeUtils.giveBadge("100033758533830286348", 3);
// badgeUtils.giveBadge("100033758533830286348", 4);
// scoreUtils.generateLeaderboard(function(leaderboard) {
// 	console.log(leaderboard);
// });
//console.log("823899009282884900098 Score: "+scoreUtils.getScore("823899009282884900098"));
//console.log(badgeUtils.getBadge(0).desc);
