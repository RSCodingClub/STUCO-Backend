//var badgeUtils = require(global.DIR + '/badgeutils');
var fs = require('fs');

var badgeData = (function() {
        try {
            return JSON.parse(fs.readFileSync(global.DIR + "/../res/badges.json"));
        } catch (e) {
            return [];
        }
    })(),
    badges = [];

var Badge = module.exports = function(badge) {
    this.valid = false;
    this.id = -1;
    var _name = "",
        _desc = "",
        _earn = "",
        _reward = 0;

    // Constructor
    if (badge) {
        if (typeof badge === "number" || typeof badge === "string") {
            this.id = Number(badge);
            var details = badgeData[badge];
            _name = details.name ? details.name : "";
            _desc = details.desc ? details.desc : "";
            _earn = details.earn ? details.earn : "";
            _reward = details.reward ? details.reward : 0;
            this.valid = true;
        } else if (badge instanceof Badge) {
            return badge;
        } else if (typeof badge === "object") {
            this.id = badge.id;
            _name = badge.name ? badge.name : "";
            _desc = badge.desc ? badge.desc : "";
            _earn = badge.earn ? badge.earn : "";
            _reward = badge.reward ? badge.reward : 0;
            this.valid = true;
        } else {
            this.valid = false
        }
    } else {
        this.valid = false;
    }

    if (this.valid) {
        badges.push(this);
    }

    this.object = function() {
        return {
            id: this.id,
            name: _name,
            desc: _desc,
            earn: _earn,
            reward: _reward
        }
    };

    // Name
    this.getName = function() {
        return _name;
    };
    this.setName = function(name) {
        _name = name;
        return true;
    };

    // Description
    this.getDesc = this.getDescription = function() {
        return _desc;
    };
    this.setDesc = this.setDescription = function(desc) {
        _desc = desc;
        return true;
    };

    // Earn
    this.getEarn = this.getHow = function() {
        return _earn;
    };
    this.setEarn = this.setHow = function(earn) {
        _earn = earn;
        return true;
    };

    // Reward
    this.getReward = function() {
        return _reward;
    };
    this.setReward = function(reward) {
        _reward = reward;
        return true;
    };
};

(function(){
    var r = []
    badgeData.forEach(function(b, i) {
        var badge = new Badge(b);
        if (badge.valid) {
            r.push(badge);
        }
    });
    badges = r;
})();

module.exports.badgeExists = function (b) {
	return badges[b] !== undefined
};

module.exports.getBadge = function(b) {
    return badges[b];
};

module.exports.getBadges = function() {
    return badges;
};
