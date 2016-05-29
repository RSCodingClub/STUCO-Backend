var fs = require('fs');

module.exports = userUtils = {
    searchUsers: function(key, value) {
        var r = [];
        var users = this.getUsers();
        var r = users.filter(function(o, i) {
            // console.log(i,o.name);
            return o[key] === value;
        });
        // console.log("SEARCH USERS ("+value+"):", r);
        return r;
    },
    getUser: function(gid) {
        var user = this.searchUsers("gid", gid)[0];
        // console.log("GET USER ("+gid+"):", user);
        return user;
    },
    getBadges: function() {
        return JSON.parse(fs.readFileSync(__dirname + "/../res/badges.json"));
    },
    getBadge: function(bid) {
        return this.getBadges()[bid];
    },
    getUsers: function() {
        return JSON.parse(fs.readFileSync(__dirname + "/../private/users.json"));
    },
    setUser: function(user, gid) {
        var users = this.getUsers();
        if (gid == undefined)
            gid = user.gid;
        if (this.userExists(gid)) {
            users.forEach(function(u, i) {
                if (u.gid == gid) {
                    users[i] = user;
                }
            });
        } else {
            users.push(user);
        }
        fs.writeFileSync(__dirname + "/../private/users.json", JSON.stringify(users));
    },
    userExists: function(gid) {
        var user = this.getUser(gid);
        // console.log("USER EXISTS ("+gid+"): "+(user == undefined || user == false));
        if (user == undefined) {
            return false;
        } else if (user == false) {
            return false;
        } else {
            return true;
        }
    },
    loginUser: function(gid, name, nickname) {
        if (require(__dirname + '/user').userExists(gid)) {
            // Login user
            res.send(require(__dirname + '/user').getUser(gid));
        } else {
            require(__dirname + '/user').createUser(gid, name, nickname);
        }
    },
    createUser: function(gid, name, nickname) {
        var user = {
            gid: gid,
            name: name,
            nickname: nickname, // Apply Censorship for profanity or rude names
            created: Date.now(),
            lastlogin: Date.now(),
            badges: [],
            scores: [],
            settings: {}
        };
        this.setUser(user);
        user.gi
    },
    giveBadge: function(gid, bid) {
        if (this.userExists(gid)) {
            if (this.hasBadge(gid, bid) == false) {
                //users = JSON.parse(fs.readFileSync(__dirname + "/../private/users.json"));
                var user = this.getUser(gid);
                console.log(user);
                user.badges.push(bid);

                this.givePoints(gid, "badge", this.getBadge(bid).earn);

                setTimeout(this.setUser(user), 200);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    hasBadge: function(gid, bid) {
        var user = this.getUser(gid),
            r = false;
        user.badges.forEach(function(b, i) {
            if (b == bid) {
                r = true;
            }
        });
        return r;
    },
    givePoints: function(gid, type, value) {
        console.log("GIVE POINTS (" + gid + "): " + value + " [" + type + "]");
        var user = this.getUser(gid);
        user.scores.push({
            type: type,
            value: value,
			timestamp: Date.now()
        });

		// IF USER HAS REACHED A MILESTONE RUN THIS here
		// EI a user reached 100 points give them another badge or a T-Shirt
		
        console.log(user);
        setTimeout(this.setUser(user), 200);
    },
    getScore: function(gid) {
        var score = 0;
        this.getUser(gid).scores.forEach(function(s, i) {
            score += s.value;
        });
        return score;
    },
    getDistance: function(lat2, lng2) {
        var lat1 = 38.521131;
        var lng1 = -90.493044;

        var earthRadius = 6371000; // meters
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dLng = (lng2 - lng1) * (Math.PI / 180);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var dist = earthRadius * c;
        return dist;
    }
};
