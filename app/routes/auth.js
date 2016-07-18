var express = require('express');
var router = express.Router({
    mergeParams: true
});
var fs = require('fs');
var log = require('log-util');
var Utils = require(global.DIR + '/utils');
var userUtils = require(global.DIR + '/userutils');
var User = require(global.DIR + '/models/user.model');

router.use(function(req, res, next) {
    req.authenticated = false
    res.set("Authenticated", false);
    req.isAuthenticated = function() {
        return req.authenticated;
    }
    if ((req.headers.authentication && req.headers.authentication.startsWith("Token ")) || (req.query.auth && req.query.auth.startsWith("Token "))) {
        var token = req.headers.authentication ? req.headers.authentication : req.query.authentication;
        userUtils.verifyToken(token.substring("Token ".length), function(err, guser) {
            if (err) {
                res.statusCode = 400;
                return res.json(Utils.getErrorObject(err));
            } else {
                User.getUser(guser.payload.sub.toString().trim(), function(err, user) {
                    if (err) {
                        return res.json(Utils.getErrorObject(new Error("User Not Found")));
                    } else {
                        if (user === undefined || user == null) {
                            User.createUser(guser, function(err, dbuser) {
                                if (err == undefined) {
                                    req.user = dbUser;
                                    req.authenticated = true;
                                    res.set("Authenticated", true);
                                }
                                return next();
                            });
                        } else {
							console.log("Authenticated as " + user.name);
                            req.user = user;
                            req.authenticated = true;
                            res.set("Authenticated", true);
                            return next();
                        }
                    }
                });
            }
        });
    } else if (req.query.key) {
        // Used for testing purposes
        res.set("Authenticated", false);
        req.authenticated = false;
        // NOTE: Temporary code to allow for testing authoirzed requests
        if (req.query.key === "MTAzNjg4NTM4Nzg0NDkzNTY0NDY4") {
            User.getUser("103688538784493564468", function(err, user) {
                if (err) {
                    return res.json(Utils.getErrorObject(new Error("Unexpected Error")));
                } else {
                    req.user = user;
                    req.authenticated = true;
                    res.set("Authenticated", true);
                    return next();
                }
            });
        } else {
            res.statusCode = 400;
            return res.json(Utils.getErrorObject(new Error("Invalid API Key")));
        }
    } else {
        return next();
    }
});

module.exports = router;
