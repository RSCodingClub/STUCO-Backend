var fs = require('fs');
//var badgeUtils = require(__dirname + '/badgeutils');
//var scoreUtils = require(__dirname + "/scoreutils");

var userUtils = module.exports = {
    getUsersAsync: function(callback) {
        var readStream = fs.createReadStream(__dirname + "/../private/users.json");
        var file = "";
        readStream.on('data', function(data) {
            //console.log("file chunk"+data.toString());
            file += data.toString();
            //console.log("FILE",file);
        });

        readStream.on('end', function() {
            try {
                callback(JSON.parse(file));
            } catch (e) {
                console.error("THERE WAS AN ERROR PARSING THE USER FILE", e.stack);
                callback([]);
            }
        });
    },
    searchUsers: function(key, value) {
        console.log("\tsearchUsers(" + key + "," + value + ")");
        var r = [];
        var users = this.getUsers();
        var r = users.filter(function(o, i) {
            // console.log(i,o.name);
            return o[key] === value;
        });
        // console.log("SEARCH USERS ("+value+"):", r);
        return r;
    },
    searchUsersAsync: function(key, value, callback) {
        console.log("\tsearchUsersAsync(" + key + "," + value + ", " + typeof callback + ")");
        var r = [];
        this.getUsersAsync(function(users) {
            var r = users.filter(function(o, i) {
                // console.log(i,o.name);
                return o[key] === value;
            });
            callback(r);
        });
    },
    getUser: function(gid) {
        console.log("\tgetUser(" + gid + ")");
        var user = this.searchUsers("gid", gid)[0];
        // console.log("GET USER ("+gid+"):", user);
        return user;
    },
    getUserAsync: function(gid, callback) {
        console.log("\tgetUserAsync(" + gid + ", " + typeof callback + ")");
        if (typeof callback == "function") {
            this.searchUsersAsync("gid", gid, function(users) {
                callback(users[0]);
            });
        }
    },
    // getUsers: function() {
    //     console.log("\tgetUsers()");
    //     return JSON.parse(fs.readFileSync(__dirname + "/../private/users.json"));
    // },
    // getUsersAsync: function(callback) {
    //     console.log("\tgetUsersAsync(" + typeof callback + ")");
    //     if (typeof callback == "function") {
    //         fs.readFile(__dirname + "/../private/users.json", function(err, data) {
    //             if (err == undefined) {
    //                 var r = [];
    //                 try {
    //                     r = JSON.parse(data);
    //                 } catch (e) {
    //                     console.error("THERE WAS AN ERROR PARSING THE USER FILE");
    //                     r = [];
    //                 }
    //                 callback(r);
    //             } else {
    //                 throw err;
    //                 return false;
    //             }
    //         });
    //     }
    // },
    setUser: function(user, gid, callback) {
        console.log("\tsetUser(" + user + "," + (typeof gid) + ", " + (typeof callback) + ")");
        this.getUsersAsync(function(users) {
            if (gid == undefined)
                gid = user.gid;
            if (typeof gid == "function") {
                callback = gid;
                gid = user.gid;
            }
            if (callback == undefined) {
                callback = function(err, data) {
                    if (err)
                        throw err;
                }
            }
            userUtils.userExistsAsync(gid, function(exists) {
                if (exists) {
                    users.forEach(function(u, i) {
                        if (u.gid == gid) {
                            users[i] = user;
                        }
                    });
                } else {
                    users.push(user);
                }
                fs.writeFile(__dirname + "/../private/users.json", JSON.stringify(users), 'utf-8', callback);
            });
        });
    },
    userExists: function(gid) {
        console.log("\tuserExists(" + gid + ")");
        var user = this.getUser(gid);
        if (user == undefined || user == false) {
            return false;
        } else {
            return true;
        }
    },
    userExistsAsync: function(gid, callback) {
        console.log("\tuserExistsAsync(" + gid + "," + typeof callback + ")");
        if (typeof callback == "function") {
            this.getUserAsync(gid, function(user) {
                if (user == undefined || user == false) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        }
    },
    loginUser: function(gid, name, nickname, callback) {
        console.log("\tloginUser(" + gid + "," + name + "," + nickname + typeof callback + ")");
        userUtils.userExistsAsync(gid, function(exists) {
            if (exists) {
                userUtils.getUserAsync(gid, function(user) {
					user.lastlogin = Date.now();
					userUtils.setUser(user, function() {
						callback(user);
					});
                });
            } else {
                userUtils.createUser(gid, name, nickname, callback);
            }
        });
    },
    createUser: function(gid, name, nickname, callback) {
        console.log("\tcreateUser(" + gid + "," + name + ", " + nickname + ")");
        var user = {
            gid: gid,
            name: name,
            nickname: nickname, // Apply Censorship for profanity or rude names
            created: Date.now(),
            lastlogin: Date.now(),
            badges: [],
            scores: [],
            settings: {}
        };
        this.setUser(user, function() {
			require(__dirname + '/badgeutils').giveBadge(gid, 0, function() {
				callback(user);
			});
        });
    }
};
