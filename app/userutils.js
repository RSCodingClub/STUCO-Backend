var fs = require('fs');
var request = require('request');
var log = require('log-util');
var format = require('dateformat');

// @ module userUtils
var userUtils = module.exports = {
    // Initialize user variable from users.json
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
                    if (false /*user.exp < Date.now() + 5000*/ ) { //DISABLE EXPIRES
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
        // log.verbose("saveUsers(" + typeof callback + ")");
        this.updateUsers(callback);
    },
    backupUsers: function(callback) {
        log.verbose("backupUsers(" + typeof callback + ")");
        var dir = __dirname + "/../private/backups/" + format('isoDate') + "/",
            file = format(new Date(), 'HH_MM_ss') + ".json";
        if (this.users == [] || this.users == "") {
            callback(new Error("User File Empty"));
        } else {
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
        }
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
        log.verbose("getUser(" + subid + ", " + typeof callback + ")");
        if (typeof callback == "function") {
            var user = undefined;
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
    getGoogleUser: function(subid, callback) {
        log.verbose("getGoogleUser(" + subid + ", " + typeof callback + ")");
        var API_KEY = "AIzaSyDQhrNxeNTp-uONV9fUuElCylSQF2MHMtI";
        var baseUrl = "https://www.googleapis.com/plus/v1/people/" + subid + "?key=" + API_KEY;
        request.get(baseUrl, function(err, res, body) {
            if (err) {
                callback(err);
            } else {
                var data = JSON.parse(body);
                callback(undefined, data);
            }
        });
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
        log.verbose("setUser(" + subid + ", " + user + ", " + typeof callback + ")");
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
        require(__dirname + '/badgeutils').giveBadge(subid, 0, function(err) {
            if (err) {
                callback(err)
            } else {
                callback(undefined, user);
            }
        });
    }
};
