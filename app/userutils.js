var fs = require('fs');
var request = require('request');
var log = require('log-util');
var format = require('dateformat');
var jwt = require('jsonwebtoken');

var googleCertificates,
    certRequests = 0;
// @ module userUtils
var userUtils = module.exports = {
    verifyToken: function(idToken, callback) {
        var s = process.hrtime();
        var decodedToken = jwt.decode(idToken, {
            complete: true,
            json: true
        });
        if (!decodedToken) {
            return callback(new Error("Malformed UserToken"));
        }
        var kid = decodedToken.header.kid;
        userUtils.getGoogleCertificates(kid, function(err, cert) {
            if (err || !cert) {
                return callback(err);
            }
            var options = {
                audience: [
                    "407408718192.apps.googleusercontent.com", // Oauth2 Playground
                    "967723309632-am5oak97qk8n6fsu1kageopv4be9tj5u.apps.googleusercontent.com" // Mobile Application
                ],
                issuer: [
                    "accounts.google.com",
                    "https://accounts.google.com"
                ]
            };
            jwt.verify(idToken, cert, options, function(err) {
                if (err) {
                    if (err.message.startsWith("jwt audience invalid.")) {
                        err = new Error("Invalid Audience");
                    } else if (err.message.startsWith("jwt expired")) {
                        err = new Error("UserToken Has Expired");
                    } else if (err.message.startsWith("jwt issuer invalid.")) {
                        err = new Error("TokenIssuer is Invalid");
                    } else if (err.message.startsWith("jwt malformed")) {
                        err = new Error("Invalid TokenCertificate");
                    } else if (err.message.startsWith("jwt signature is required")) {
                        err = new Error("Google Certificates Retrieval Error");
                    } else {
						log.error(err);
                        err = new Error("Google Token Validation Failed");
                    }
                    return callback(err);
                } else {
                    if (decodedToken.payload.email.endsWith("@rsdmo.org") && decodedToken.payload.email_verified) {
                        var time = process.hrtime(s);
                        log.verbose("Verify Token took\t" + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + "ms.");
                        return callback(undefined, decodedToken);
                    } else {
                        // TODO: Temporarily disabled for testing
                        return callback(undefined, decodedToken);
                        // return callback(new Error("Invalid Email Domain"));
                    }
                }
            });
        });
    },
    // Verify Google Certificates every 32nd request
    // Cuts back reponse time of requests by 90ms
    getGoogleCertificates: function(kid, callback) {
        var s = process.hrtime();
        certRequests++;
        if (googleCertificates === undefined || certRequests % 32 === 0) {
            request({
                uri: 'https://www.googleapis.com/oauth2/v1/certs'
            }, function(err, res, body) {
                if (err || !res || res.statusCode !== 200) {
                    err = err || new Error("Google Certificates Retrieval Error");
                    return callback(err);
                } else {
                    try {
                        var time = process.hrtime(s);
                        log.verbose("Get Google Certificates took\t" + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + "ms.");
                        googleCertificates = JSON.parse(body)[kid];
                        return callback(null, JSON.parse(body)[kid]);
                    } catch (e) {
                        return callback(new Error("Certificate Parsing Error"));
                    }
                }
            });
        } else {
            var time = process.hrtime(s);
            log.verbose("Get Google Certificates took\t" + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + "ms.");
            return callback(null, googleCertificates);
        }
    },
    getGoogleUser: function(subid, callback) {
        log.verbose("getGoogleUser(" + subid + ", " + typeof callback + ")");
        var baseUrl = "https://www.googleapis.com/plus/v1/people/" + subid + "?key=" + global.API_KEY;
        request.get(baseUrl, function(err, res, body) {
            if (err) {
                return callback(err);
            } else {
                var data = JSON.parse(body);
                return callback(undefined, data);
            }
        });
    }
};
