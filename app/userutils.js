const request = require('request-promise-native');
const log = require('log-util');
const jwt = require('jsonwebtoken');

let googleCertificates;
let certRequests = 0;
let certThreshhold = global.ENV === 'development' ? 5 : 100;

let userUtils = module.exports = {
    verifyToken: function(idToken) {
        let s = process.hrtime();
        return new Promise((done, reject) => {
            let decodedToken = jwt.decode(idToken, {
                complete: true,
                json: true
            });
            if (!decodedToken) {
                return reject(new Error('Malformed UserToken'));
            }
            let kid = decodedToken.header.kid;
            userUtils.getGoogleCertificatesPromise(kid).then((cert) => {
                if (cert == undefined) return reject(new Error('Certificate Not Found'));
                let options = {
                    audience: [
                        '407408718192.apps.googleusercontent.com', // Oauth2 Playground
                        '967723309632-am5oak97qk8n6fsu1kageopv4be9tj5u.apps.googleusercontent.com' // Mobile Application
                    ],
                    issuer: [
                        'accounts.google.com',
                        'https://accounts.google.com'
                    ]
                };
                jwt.verify(idToken, cert, options, function(err) {
                    if (err) {
                        if (err.message.startsWith('jwt audience invalid.')) return reject(new Error('Invalid Audience'));
                        if (err.message.startsWith('jwt expired')) return reject(new Error('UserToken Has Expired'));
                        if (err.message.startsWith('jwt issuer invalid.')) return reject(new Error('TokenIssuer is Invalid'));
                        if (err.message.startsWith('jwt malformed')) return reject(new Error('Invalid TokenCertificate'));
                        if (err.message.startsWith('jwt signature is required')) return reject(new Error('Google Certificates Retrieval Error'));
                        return reject(new Error('Google Token Validation Failed'));
                    } else {
                        if (decodedToken.payload.email_verified && (global.ENV === 'development' || decodedToken.payload.email.endsWith('@rsdmo.org'))) {
                            let time = process.hrtime(s);
                            log.verbose('Verify Token took\t' + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + 'ms.');
                            return done(decodedToken);
                        } else {
                            return reject(new Error('Invalid Email Domain'));
                        }
                    }
                });
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    // Verify Google Certificates every 5th request for development or 100th request for production
    // Cuts back reponse time of each requests by 90ms
    getGoogleCertificatesPromise: function(kid) {
        let s = process.hrtime();
        certRequests++;
        return new Promise((done, reject) => {
            if (googleCertificates === undefined || certRequests % certThreshhold === 0) {
                request({
                    uri: 'https://www.googleapis.com/oauth2/v1/certs',
                }).then((body) => {
                    try {
                        let time = process.hrtime(s);
                        log.verbose('Get Google Certificates took\t' + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + 'ms.');
                        googleCertificates = JSON.parse(body)[kid];
                        return done(JSON.parse(body)[kid]);
                    } catch (e) {
                        return reject(new Error('Certificate Parsing Error'));
                    }
                }).catch(() => {
                    return reject(new Error('Google Certificates Retrieval Error'));
                });

            } else {
                let time = process.hrtime(s);
                log.verbose('Get Google Certificates took\t' + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + 'ms.');
                return done(googleCertificates);
            }
        });
    },
    getGoogleCertificates: function(kid, callback) {
        let s = process.hrtime();
        certRequests++;
        if (googleCertificates === undefined || certRequests % certThreshhold === 0) {
            request({
                uri: 'https://www.googleapis.com/oauth2/v1/certs',
            }).then((body) => {
                try {
                    let time = process.hrtime(s);
                    log.verbose('Get Google Certificates took\t' + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + 'ms.');
                    googleCertificates = JSON.parse(body)[kid];
                    return callback(undefined, JSON.parse(body)[kid]);
                } catch (e) {
                    return callback(new Error('Certificate Parsing Error'));
                }
            }).catch(() => {
                return callback(new Error('Google Certificates Retrieval Error'));
            });

        } else {
            let time = process.hrtime(s);
            log.verbose('Get Google Certificates took\t' + ((time[0] / 1000) + (time[1] / Math.pow(1 * 10, 6))) + 'ms.');
            return callback(undefined, googleCertificates);
        }
    },
    getGoogleUser: function(subid) {
        let baseUrl = 'https://www.googleapis.com/plus/v1/people/' + subid + '?key=' + global.API_KEY;
        return new Promise((done, reject) => {
            request.get(baseUrl).then((res, body) => {
                try {
                    return done(JSON.parse(body));
                } catch (e) {
                    return reject(e);
                }
            }).catch((err) => {
                return reject(err);
            });
        });
    }
};
