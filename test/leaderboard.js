var request = require('request');
var expect = require('chai').expect;
var assert = require('chai').assert;

var host = "http://itotallyrock.cf:80";
var url = host + "/api/";
var API_KEY = "MTAzNjg4NTM4Nzg0NDkzNTY0NDY4";

describe("Test Obtaining the Leaderboard", function () {
	describe('Authenticated', function () {
		it("returns status 200", function (done) {
			request.get(url + "user/v1/leaderboard?key=" + API_KEY, function (err, res, body) {
				expect(res.statusCode).to.equal(200);
				done(err);
			});
		});
		it("returns a json array of public users", function (done) {
			request.get(url + "user/v1/leaderboard?key=" + API_KEY, function (err, res, body) {
				// expect(JSON.parse(body)).to.be.an("object");
				assert(JSON.parse(body) instanceof [].constructor, "Leaderboard is not a JSON Array");
				done(err);
			});
		});
	});

	describe('Unauthenticated', function () {
		it("returns status 400", function (done) {
			request.get(url + "user/v1/leaderboard?key=abc123", function (err, res, body) {
				expect(res.statusCode).to.equal(400);
				done(err);
			});
		});
		it("returns an error object", function (done) {
			request.get(url + "user/v1/leaderboard?key=abc123", function (err, res, body) {
				// expect(JSON.parse(body)).to.be.an("object");
				assert((JSON.parse(body)) instanceof ({}).constructor, "Failed to return an error object");
				done(err);
			});
		});
	});
});
