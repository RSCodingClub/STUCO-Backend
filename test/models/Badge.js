const {expect} = require('chai');
const Badge = require(__dirname.replace('test', 'app') + '/Badge.model');

describe('Badge Model', function () {
	describe('Schema', function () {
		let badge = new Badge({});
		expect(badge).to.not.be.undefined;
	});
});
