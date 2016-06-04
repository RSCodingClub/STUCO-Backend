var fs = require('fs');
var request = require('request');
var log = require('log-util');
var format = require('dateformat');

var userUtils = module.exports = {
    users: (function() {
        log.verbose("users()");
        try {
            return JSON.parse(fs.readFileSync(__dirname + "/../private/users.json"));
        } catch (e) {
            log.error(e.stack);
            return [];
        }
    })(),
    verifyToken: function(token, callback) {
        log.verbose("verifyToken(\"" + token.substring(0, 10) + "...\", " + typeof callback + ")");
        if (typeof callback == "function") {
            var baseUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=";
            var certsUrl = "https://www.googleapis.com/oauth2/v3/certs";
            var requestUrl = baseUrl + token;
            request.get(requestUrl, function(err, res, body) {
                if (!err && res.statusCode == 200) {
                    var user = JSON.parse(body);
                    if (false /*user.exp < Date.now() + 5000*/) { //DISABLE EXPIRES
                        callback(new Error("UserToken Has Expired"));
                    } else {
                        if (user.iss.startsWith("https://accounts.google.com") || user.iss.startsWith("accounts.google.com")) {
                            request.get(certsUrl, function(error, resp, data) {
                                var certs = JSON.parse(data).keys;
                                var valid = false;
                                certs.forEach(function(o, i) {
                                    if (user.kid == o.kid) {
                                        if (user.alg == o.alg) {
                                            valid = true;
                                        }
                                    }
                                });
                                if (valid) {
                                    callback(undefined, user);
                                } else {
                                    callback(new Error("Invalid TokenCertificate"));
                                }
                            });
                        } else {
                            callback(new Error("TokenIssuer is Invalid"));
                        }
                    }
                } else {
                    callback(new Error("Google Token Validation Failed"));
                }
            });
        }
    },
    initUsers: function(callback) {
        log.verbose("initUsers(" + typeof callback + ")");
        if (callback == undefined || typeof callback !== "function") {
            callback = function(err, users) {
                return true;
            }
        }
        fs.readFile(__dirname + "/../private/users.json", "utf-8", function(err, data) {
            if (err) {
                callback(err);
            } else {
                try {
                    var users = JSON.parse(data);
                    this.users = users;
                    callback(undefined, users);
                } catch (e) {
					this.users = [];
                    callback(e);
					// callback(undefined, this.users);
                }
            }
        });
    },
    updateUsers: function(callback) {
        // log.verbose("updateUsers(" + typeof callback + ")");
        if (callback == undefined || typeof callback !== "function") {
            callback = function(err, users) {
                return true;
            }
        }
        fs.writeFile(__dirname + "/../private/users.json", JSON.stringify(this.users), "utf-8", function(err) {
            callback(err, this.users);
        });
    },
    saveUsers: function(callback) {
        this.updateUsers(callback);
    },
    backupUsers: function(callback) {
        log.verbose("backupUsers(" + typeof callback + ")");
        var dir = __dirname + "/../private/backups/" + format('isoDate') + "/",
            file = format(new Date(), 'HH_MM_ss') + ".json";
        fs.readdir(dir, function(err, files) {
            if (err) {
                fs.mkdir(dir, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        fs.writeFile(dir + file, JSON.stringify(userUtils.users), "utf-8", function(err) {
                            if (err)
                                callback(err);
                        });
                    }
                });
            } else {
                fs.writeFile(dir + file, JSON.stringify(userUtils.users), "utf-8", function(err) {
                    if (err)
                        callback(err);
                });
            }
        });
    },
    getUsers: function(callback) {
        log.verbose("getUsers(" + typeof callback + ")");
        if (callback == undefined || typeof callback !== "function") {
            callback = function(err, users) {
                return true;
            }
        }
        callback(this.users);
    },
    getUsersSync: function() {
        log.verbose("getUsersSync()");
        return this.users;
    },
    getUser: function(subid, callback) {
        if (typeof callback == "function") {
			var user = undefined;
            log.verbose("getUser(" + subid + ", " + typeof callback + ")");
            this.users.forEach(function(u, i) {
                if (u.subid == subid) {
	                user = u;
                }
            });
			if (user) {
				callback(undefined, user);
			} else {
				callback(new Error("User Not Found"));
			}
        }
    },
    getUserSync: function(subid) {
        log.verbose("getUserSync(" + subid + ")");
        var r = undefined;
        this.users.forEach(function(u, i) {
            if (u.subid == subid) {
                r = u;
            }
        });
        return r;
    },
    userExists: function(subid, callback) {
        log.verbose("userExists(" + subid + ", " + typeof callback + ")");
        this.getUser(subid, function(err, user) {
            if (err) {
                callback(false);
            } else if (user !== undefined) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },
    userExistsSync: function(subid) {
        log.verbose("userExistsSync(" + subid + ")");
        return this.getUserSync(subid) !== undefined;
    },
    setUser: function(s, u, c) {
        var args = arguments,
            callback = c || function(err) {
                if (err)
                    log.error(err.stack);
            },
            subid = s,
            user = u,
            r = false;
        for (var i = 0; i < args.length; i++) {
            var o = args[i];
            if (typeof o == "function") {
                callback = o;
            } else if (typeof o == "string") {
                subid == o;
            } else if (typeof o == "object") {
                user = o;
            }
        }
        this.users.forEach(function(u, i) {
            if (u.subid == subid) {
                this.users[i] = user;
                r = true;
            }
        });
        if (r == false) {
            callback(new Error("User Not Found"));
        } else if (r == true) {
            callback(undefined, user);
        }
    },
    // setUserOld: function(s, u, c) {
    //     var args = arguments,
    //         callback = c || function(err) {
    //             if (err)
    //                 log.error(err.stack);
    //         },
    //         sub = s,
    //         user = u;
    //     for (var i = 0; i < args.length; i++) {
    //         var o = args[i];
    //         if (typeof o == "function") {
    //             callback = o;
    //         } else if (typeof o == "string") {
    //             sub == o;
    //         } else if (typeof o == "object") {
    //             user = o;
    //         }
    //     }
    //     if (typeof user !== "object") {
    //         callback(new Error("Invalid User " + typeof user));
    //     }
    //     if (sub == undefined) {
    //         sub == user.sub
    //     }
    //     userUtils.userExists(sub, function(exists) {
    //         if (exists) {
    //             userUtils.users.forEach(function(u, i) {
    //                 if (u.sub == sub) {
    //                     users[i] = user;
    //                 }
    //             });
    //             callback(undefined, user);
    //         } else {
    //             userUtils.users.push(user);
    //             callback(undefined, user);
    //         }
    //         //fs.writeFile(__dirname + "/../private/users.json", JSON.stringify(users), 'utf-8', callback);
    //     });
    // },
    createUser: function(subid, nickname, callback) {
        log.verbose("createUser(" + subid + ", " + nickname + ", " + typeof callback + ")");
        var user = {
            subid: subid,
            nickname: nickname,
            badges: [],
            scores: [],
            settings: {}
        };
        userUtils.users.push(user);
        //this.setUser(user, function(err) {
        //    if (err) {
        //        callback(err);
        //    } else {
        require(__dirname + '/badgeutils').giveBadge(subid, 0, function(err) {
            if (err) {
                callback(err)
            } else {
                callback(undefined, user);
            }
        });
        //    }
        //});
    }
};
