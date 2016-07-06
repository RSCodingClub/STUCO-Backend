var request = require('request');
var expect = require('chai').expect;
var assert = require('chai').assert;

var host = "http://localhost:80";
var url = host + "/api/";

describe('Get Leaderboard', function () {
	it("returns status 200", function (done) {
		request.get(url + "user/v1/leaderboard", function (err, res, body) {
			expect(res.statusCode).to.equal(200);
			done();
		});
	});
	it("returns a json array of public users", function (done) {
		request.get(url + "user/v1/leaderboard", function (err, res, body) {
			// expect(JSON.parse(body)).to.be.an("object");
			assert(JSON.parse(body) instanceof [].constructor, "Leaderboard is not a JSON Array");
			done();
		});
	});
});
