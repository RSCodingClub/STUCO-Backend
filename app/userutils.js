var fs = require('fs');
var request = require('request');
var log = require('log-util');
var format = require('dateformat');

// @ module userUtils
var userUtils = module.exports = {
    verifyToken: function(token, callback) {
        log.verbose("verifyToken(\"" + token.substring(0, 10) + "...\", " + typeof callback + ")");
        if (typeof callback == "function") {
            var baseUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=";
            var certsUrl = "https://www.googleapis.com/oauth2/v3/certs";
            var requestUrl = baseUrl + token;
            request.get(requestUrl, function(err, res, body) {
                if (!err && res.statusCode == 200) {
                    var user = JSON.parse(body);
                    if (user.iat + (3600 * 1000) < Date.now()) {
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
    getGoogleUser: function(subid, callback) {
        log.verbose("getGoogleUser(" + subid + ", " + typeof callback + ")");
        var baseUrl = "https://www.googleapis.com/plus/v1/people/" + subid + "?key=" + global.API_KEY;
        request.get(baseUrl, function(err, res, body) {
            if (err) {
                callback(err);
            } else {
                var data = JSON.parse(body);
                callback(undefined, data);
            }
        });
    }
};
