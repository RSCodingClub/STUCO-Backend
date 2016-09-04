var request = require('request');
var expect = require('chai').expect;
var assert = require('chai').assert;

var host = 'http://itotallyrock.cf:80';
var url = host + '/api/';
var API_KEY = 'MTAzNjg4NTM4Nzg0NDkzNTY0NDY4';
var TEST_USER = '103688538784493564468';

describe('Test Getting User Information', function () {
	describe('Authenticated', function () {
		it('returns 200 status', function (done) {
			request.get(url + 'user/v1/' + TEST_USER + '/public?key=' + API_KEY, function (err, res) {
				expect(res.statusCode).to.equal(200);
				done(err);
			});
		});
		it('returns a json user object', function (done) {
			request.get(url + 'user/v1/' + TEST_USER + '/public?key=' + API_KEY, function (err, res, body) {
				expect(JSON.parse(body)).to.not.have.property('errorid');
				assert(JSON.parse(body) instanceof ({}).constructor, 'User is not a JSON Object');
				expect(JSON.parse(body)).to.have.property('subid');
				done(err);
			});
		});
	});
	describe('Unauthenticated', function () {
		it('should return 400 status', function (done) {
			request.get(url + 'user/v1/' + TEST_USER + '/public?key=abc', function (err, res) {
				expect(res.statusCode).to.equal(400);
				done(err);
			});
		});
		it('returns a json user object', function (done) {
			request.get(url + 'user/v1/' + TEST_USER + '/public?key=abc', function (err, res, body) {
				expect(JSON.parse(body)).to.have.property('errorid');
				expect(JSON.parse(body)).to.not.have.property('subid');
				done(err);
			});
		});
	});
});

// describe('Get Leaderboard Authenticated', function () {
// 	it("returns status 200", function (done) {
// 		request.get(url + "user/v1/leaderboard?key" + API_KEY, function (err, res, body) {
// 			expect(res.statusCode).to.equal(200);
// 			done(err);
// 		});
// 	});
// 	it("returns a json array of public users", function (done) {
// 		request.get(url + "user/v1/leaderboard?key" + API_KEY, function (err, res, body) {
// 			// expect(JSON.parse(body)).to.be.an("object");
// 			assert(JSON.parse(body) instanceof [].constructor, "Leaderboard is not a JSON Array");
// 			done(err);
// 		});
// 	});
// });
