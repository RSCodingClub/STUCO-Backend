// var Badge = require(global.DIR + '/classes/badge');
// var fs = require('fs');
// var format = require('dateformat');
// var log = require('log-util');
// var Utils = require(global.DIR + '/utils')
// var validator = require('validator');
// var mongoose = require('mongoose');
// var UserModel = require(global.DIR + '/models/user.model');
//
// // var generateUserMap = function(users) {
// //         var r = {};
// //         users.forEach(function(u, i) {
// //             r[u.subid.toString()] = u;
// //         });
// //         return r;
// //     },
// //     users = [],
// //     userMap = generateUserMap(users);
//
// var User = module.exports = function(user) {
//     this.subid = "";
//     this.valid = false;
//     var _nickname = "",
//         _name = "",
//         _email = "",
//         _scores = [],
//         _badges = [],
//         _permissions = [];
//
//     // CONSTRUCTOR
//     if (user) {
//         if (typeof user == "string" || typeof user == "number") {
//             // user is subid return pre existing object
//             if (userMap[user] !== undefined) {
//                 return userMap[user];
//             } else {
//                 this.valid = false;
//             }
//         } else if (user instanceof User) {
//             // user is a user object
//             return user;
//         } else if (typeof user == "object") {
//             // user is json object
//             if (user.subid && user.nickname) {
//                 this.subid = user.subid;
//                 _nickname = validator.escape(encodeURIComponent(user.nickname));
//                 _name = user.name ? user.name : "";
//                 _email = validator.isEmail(user.email.toString()) ? user.email.toString() : "";
//                 _scores = (user.scores) ? user.scores : [];
//                 _badges = (user.badges) ? user.badges : [];
//                 _permissions = (user.permissions) ? user.permissions : ["user.view.public", "bugreports.create"]; // TODO: Add Default Permissions
//                 this.valid = true;
//             } else {
//                 this.valid = false;
//             }
//         }
//     }
//     // // NOTE: Possible crash or at least issues when a user is added twice and should be checked for pre existing user
//     // if (this.valid /*&& !module.exports.userExists(this.subid)*/ ) {
//     //     users.push(this);
//     //     userMap = generateUserMap(users);
//     // }
//
//     // UTILS
//     this.toString = function() {
//         return validator.unescape(decodeURIComponent(_nickname)).toString();
//     };
//     this.object = function() {
//         return {
//             subid: this.subid,
//             nickname: validator.unescape(decodeURIComponent(_nickname)),
//             name: _name,
//             email: _email,
//             scores: _scores,
//             badges: _badges,
//             permissions: _permissions
//         };
//     };
//     this.getPublicUser = function() {
//         return {
//             subid: this.subid,
//             nickname: validator.unescape(decodeURIComponent(_nickname)),
//             score: this.getScore(),
//             badges: _badges
//         }
//     };
//
//     // NICKNAME
//     this.getNickname = function() {
//         return validator.unescape(decodeURIComponent(_nickname));
//     };
//     this.setNickname = function(n) {
//         _nickname = validator.escape(encodeURIComponent(n));
//         return true;
//     };
//
//     // NAME
//     this.getName = function() {
//         return _name;
//     };
//     this.setName = function(n) {
//         _name = n;
//         return true;
//     };
//
//     // EMAIL
//     this.getEmail = function() {
//         return _email;
//     };
//
//     // SCORE
//     this.getScores = function() {
//         return _scores;
//     };
//     this.giveScore = function(t, v, e) {
//         var score = {
//             type: t,
//             value: v,
//             timestamp: Date.now(),
//             eid: e
//         };
//         _scores.push(score);
//         // Badge for 50 points
//         if (this.getScore() >= 50) {
//             this.giveBadge(22);
//         }
//         // Badge for 100 points
//         if (this.getScore() >= 100) {
//             this.giveBadge(29);
//         }
//         return true;
//     };
//     this.removeScore = function(t) {
//         _scores.forEach(function(score, i) {
//             if (score.timestamp == t) {
//                 _scores.splice(i, 1);
//                 return true;
//             }
//         });
//         return false;
//     };
//     this.getScore = function() {
//         var total = 0;
//         _scores.forEach(function(score, i) {
//             total += score.value;
//         });
//         return total;
//     };
//
//     // BADGES
//     this.getBadges = function() {
//         return _badges;
//     };
//     this.hasBadge = function(b) {
//         var r = false;
//         _badges.forEach(function(o, i) {
//             if (o.toString() == b.toString().trim()) {
//                 r = true;
//             }
//         });
//         return r;
//     };
//     this.giveBadge = function(b) {
//         if (typeof b == "number") {
//             if (this.hasBadge(b)) {
//                 return false;
//             } else {
//                 _badges.push(parseInt(b));
//                 var badge = Badge.getBadge(b);
//                 this.giveScore("badge", badge.getReward());
//                 return true;
//             }
//         } else {
//             return false;
//         }
//     };
//     this.takeBadge = function(b) {
//         _badges.forEach(function(o, i) {
//             if (o == b) {
//                 _badges.splice(i, 1);
//                 return true;
//             }
//         });
//         return false;
//     };
//
//     // PERMISSIONS
//     this.getPermissions = function() {
//         return _permissions;
//     };
//     this.hasPermission = function(permission) {
//         log.verbose("User().hasPermission(" + permission + ")");
//         var matches = [permission];
//         var permArray = permission.split(".");
//         var r = false;
//         permArray.forEach(function(p, i) {
//             permArray[permArray.length - 1] = "*";
//             matches.push(permArray.join("."));
//             permArray.splice(permArray.length - 1, 1);
//         });
//         matches.push("*");
//         matches.forEach(function(m, i) {
//             _permissions.forEach(function(p, q) {
//                 if (m == p) {
//                     r = true;
//                 }
//             });
//         });
//         return r;
//     };
//     this.givePermission = function(permission) {
//         log.verbose("User().givePermission(" + permission + ")");
//         if (this.hasPermission(permission)) {
//             return false;
//         } else {
//             _permissions.push(permission);
//             return true;
//         }
//     };
//     this.removePermission = function(permission) {
//         log.verbose("User().removePermission(" + permission + ")");
//         _permissions.forEach(function(p, i) {
//             if (p == permission) {
//                 _permissions.splice(i, 1);
//                 return true;
//             }
//         });
//         return false;
//     };
// };
//
// var userData = (function() {
//     try {
//         return JSON.parse(fs.readFileSync(global.DIR + "/../private/users.json"));
//     } catch (e) {
//         // TODO Return last backup if userdata fails to read
//         return [];
//     }
// })();
//
// // (function() {
// //     var r = []
// //     userData.forEach(function(u, i) {
// //         var user = new User(u);
// //         if (user.valid) {
// //             r.push(user);
// //         }
// //     });
// //     users = r;
// // })();
//
// // module.exports.export = function(callback) {
// //     var r = [];
// //     this.getUsers(function (err, users) {
// //     	if (err) {
// // 			callback(err)
// // 		} else {
// // 			users.forEach(function(u, i) {
// // 		        r.push(u.object());
// // 		    });
// // 			callback(err, r);
// // 		}
// //     });
// //     // userMap = generateUserMap(users);
// //     // return r;
// // };
//
// // module.exports.backup = function() {
// //     if (typeof callback !== "function") {
// //         callback = function(err) {};
// //     }
// //     var dir = global.DIR + "/../private/backups/" + format('isoDate') + "/",
// //         file = format(new Date(), 'HH_MM_ss') + ".json";
// //     if (this.users == [] || this.users == "") {
// //         callback(new Error("User File Empty"));
// //     } else {
// //         fs.readdir(dir, function(err, files) {
// //             if (err) {
// //                 fs.mkdir(dir, function(err) {
// //                     if (err) {
// //                         callback(err);
// //                     } else {
// //                         fs.writeFile(dir + file, JSON.stringify(User.export()), "utf-8", function(err) {
// //                             if (err)
// //                                 callback(err);
// //                         });
// //                     }
// //                 });
// //             } else {
// //                 fs.writeFile(dir + file, JSON.stringify(User.export()), "utf-8", function(err) {
// //                     if (err)
// //                         callback(err);
// //                 });
// //             }
// //         });
// //     }
// // };
//
// module.exports.getUser = function(subid, callback) {
//     subid = (subid).toString();
//     UserModel.findOne({
//         subid: subid
//     }, function(err, user) {
//         if (err || user == undefined || user == null) {
//             callback(new Error("User Not Found"));
//         } else {
//             callback(undefined, new User(user));
//         }
//     });
// };
//
// module.exports.userExists = function(subid, callback) {
//     this.getUser(subid, function(err, user) {
//         if (err) {
//             callback(false);
//         } else {
//             callback(true);
//         }
//     })
// };
//
// module.exports.getUsers = function(callback) {
//     UserModel.find(function(err, users) {
// 		if (err) {
// 			callback(err);
// 		} else {
// 			var r = [];
// 			users.forEach(function (u, i) {
// 				r[i] = new User(u);
// 			});
// 	        callback(err, r);
// 		}
//     });
// };
//
// module.exports.getLeaderboard = function(callback) {
//     var scores = [];
//     this.getUsers(function(err, users) {
//         if (err) {
//             callback(err);
//         } else {
//             if (users.length > 0) {
//                 users.forEach(function(u, i) {
//                     scores.push(u.getPublicUser());
//                 });
//                 scores.sort(function(a, b) {
//                     if (a.score > b.score) {
//                         return -1;
//                     }
//                     if (a.score < b.score) {
//                         return 1;
//                     }
//                     return 0;
//                 });
//             }
//             callback(undefined, scores);
//         }
//     });
// }
