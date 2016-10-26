const express = require('express');
const router = express.Router({
    mergeParams: true
});
const passport = require('passport');
const Utils = require(global.DIR + '/utils');

router.use(function (req, res, next) {
	if (req.headers.authentication !== undefined) req.body.id_token = req.headers.authentication.startsWith('Token ') ? req.headers.authentication.substring(req.headers.authentication.indexOf('Token ') + 'Token '.length) : req.headers.authentication;
	if (req.headers.id_token !== undefined) req.body.id_token = req.headers.id_token;
	if (req.query.auth !== undefined) req.body.id_token = req.query.auth;

	if (req.headers.apikey !== undefined) {
		console.log('Has apikey header param');
		passport.authenticate('localapikey', function (err) {
			if (err) {
				res.json(Utils.getErrorObject(new Error('Invalid API Key')));
			}
			return next();
		})(req, res, next);
	}

	passport.authenticate('google-id-token', function (err, user, info) {
		if (err) {
			res.json(Utils.getErrorObject(new Error('Google Token Validation Failed')));
		}
		if (info) {
			if (info.message.startsWith('jwt audience invalid.')) return res.json(Utils.getErrorObject(new Error('Invalid Audience')));
			if (info.message.startsWith('jwt expired')) return res.json(Utils.getErrorObject(new Error('UserToken Has Expired')));
			if (info.message.startsWith('jwt issuer invalid.')) return res.json(Utils.getErrorObject(new Error('TokenIssuer is Invalid')));
			if (info.message.startsWith('jwt malformed')) return res.json(Utils.getErrorObject(new Error('Invalid TokenCertificate')));
			if (info.message.startsWith('jwt signature is required')) return res.json(Utils.getErrorObject(new Error('Google Certificates Retrieval Error')));
		}
		return next();
	})(req, res, next);
});

module.exports = router;
