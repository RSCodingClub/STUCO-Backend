const {expect} = require('chai');
const Badge = require(global.DIR + '/models/Badge.models');

describe('Badge Model', function () {
	describe('Schema', function () {
		let badge = new Badge({});
		expect(badge).to.not.be.undefined;
	});
});
