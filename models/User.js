const validator = require('validator')
const Badge = require('./Badge')
const logger = require('winston')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// TODO: Add debug and logging

let UserSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    maxlength: 48,
    default: ''
  },
  nickname: {
    type: String,
    maxlength: 36,
    default: ''
  },
  email: {
    type: String,
    required: true,
    validate: (email) => {
      return validator.isEmail(email) && email.endsWith('@rsdmo.org')
    },
    unique: true
  },
  scores: {
    type: Array,
    default: []
  },
  badges: {
    type: Array,
    default: []
  },
  role: {
    type: String,
    enum: [
      'student',
      'tester',
      'teacher',
      'stuco',
      'developer',
      'admin'
    ],
    default: 'student'
  },
  apikey: {
    type: String,
    default: () => {
      return require('crypto')
        .randomBytes(24)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    }
  },
  created: {
    type: Date,
    default: new Date()
  },
  lastlogin: {
    type: Date,
    default: new Date()
  },
  updated: {
    type: Date,
    default: new Date()
  }
})

UserSchema.pre('save', function (next) {
  const debug = require('debug')('stuco:model:user:presave')
  debug('adding updated_at, created_at, and lastlogin parameters to user')
  this.updated = new Date()
  // Check to see if we need to give new badges for score increase
  let badgeJobs = []
  if (this.getScore() >= 50 && !this.hasBadge(22)) {
    debug('score is greater than 50 giving badge 22')
    badgeJobs.push(this.giveBadge(22))
  }
  if (this.getScore() >= 100 && !this.hasBadge(29)) {
    debug('score is greater than 100 giving badge 29')
    badgeJobs.push(this.giveBadge(29))
  }
  Promise.all(badgeJobs).then((responses) => {
    return next()
  }).catch((giveBadgeError) => {
    return next(giveBadgeError)
  })
})

UserSchema.post('save', function (dbUser) {
  const debug = require('debug')('stuco:model:user:postsave')
  debug('successfully saved user')
})

// Formatting
UserSchema.methods.toString = function () {
  const debug = require('debug')('stuco:model:user:tostring')
  debug('sending nickname')
  return (this.nickname || this.name).toString().trim()
}
UserSchema.methods.getPublicUser = function () {
  const debug = require('debug')('stuco:model:user:getpublic')
  debug('getting public user')
  return {uid: this.uid, name: this.name, nickname: this.nickname, score: this.getScore(), badges: this.badges, role: this.role}
}
UserSchema.methods.exportUser = function () {
  const debug = require('debug')('stuco:model:user:exportuser')
  debug('exporting user')
  return {
    uid: this.uid,
    name: this.name,
    nickname: this.nickname,
    email: this.email,
    scores: this.scores,
    badges: this.badges,
    role: this.role,
    apikey: this.apikey
  }
}

// Scores
UserSchema.methods.hasScore = function (search) {
  const debug = require('debug')('stuco:model:user:hasscore')
  debug('called with %o', search)
  return Boolean(this.scores.filter((score) => {
    let fullmatch = 0
    for (let query in search) {
      if (search.hasOwnProperty(query)) {
        if (score.hasOwnProperty(query) && score[query] === search[query]) {
          fullmatch++
        }
      }
    }
    return (fullmatch === Object.keys(search).length)
  }).length)
}
UserSchema.methods.giveScore = function (options) {
  const debug = require('debug')('stuco:model:user:givescore')
  let self = this
  let Score = function (options) {
    if (!isNaN(options.value)) {
      this.value = parseInt(options.value)
    } else {
      this.value = 0
    }
    if (options.timestamp) {
      this.timestamp = options.timestamp
    } else {
      this.timestamp = Date.now()
    }
    if (self.hasScore({timestamp: this.timestamp})) {
      this.timestamp++
    }
    if (options.type == null) {
      this.type = 'unknown'
    } else {
      this.type = options.type
    }
    if (options.type === 'event' || options.eid) {
      this.eid = options.eid
    } else {
      this.eid = -1
    }
    if (options.type === 'badge' || options.bid != null) {
      this.bid = options.bid
    } else {
      this.bid = -1
    }
    return {value: this.value, type: this.type, timestamp: this.timestamp, eid: this.eid, bid: this.bid}
  }
  let score = Score(options)
  debug('giving "' + this.uid + '" ' + score.value + ' points')
  debug('pushing score object %o', score)
  this.scores.push(score)
  return this
}
UserSchema.methods.removeScore = function (search) {
  const debug = require('debug')('stuco:model:user:removescore')
  debug('score length before removal', this.scores.length)
  this.scores = this.scores.filter((score) => {
    let fullmatch = 0
    for (let query in search) {
      if (search.hasOwnProperty(query)) {
        if (score.hasOwnProperty(query) && score[query] === search[query]) {
          fullmatch++
        }
      }
    }
    return (fullmatch !== Object.keys(search).length)
  })
  debug('score length after removal', this.scores.length)
  return this
}
UserSchema.methods.getScore = function () {
  const debug = require('debug')('stuco:model:user:getscore')
  debug('getting %d scores from "%s"', this.scores.length, this.uid)
  return this.scores.reduce((previous, current) => ({
    value: previous.value + current.value
  })).value
}

// Badges
UserSchema.methods.hasBadge = function (badgeId) {
  const debug = require('debug')('stuco:model:user:hasbadge')
  debug('getting badge "' + badgeId + '" from ' + this.uid)
  return this.badges.includes(badgeId)
}
UserSchema.methods.giveBadge = function (badgeId) {
  const debug = require('debug')('stuco:model:user:givebadge')
  badgeId = parseInt(badgeId)
  if (isNaN(badgeId)) {
    debug('badgeid was not a parsable number')
    return Promise.reject(new Error('Badge ID Must Be a Number'))
  }
  return new Promise((resolve, reject) => {
    if (this.hasBadge(badgeId)) {
      debug('failed user already has badge "' + badgeId + '"')
      return reject(new Error('User Already Has Badge'))
    } else {
      debug('success user does not have badge "' + badgeId + '"')
      Badge.getBadge(badgeId).then((badge) => {
        if (badge == null) {
          return reject(new Error('Badge Not Found'))
        }
        this.badges.push(badge.bid)
        debug('giving badge reward')
        this.giveScore({type: 'badge', value: badge.reward, bid: badgeId})
        return resolve(this)
      }).catch((dbError) => {
        debug('database error retrieving badge')
        logger.error(dbError, {context: 'dbError'})
        return reject(dbError)
      })
    }
  })
}
UserSchema.methods.takeBadge = function (badgeId) {
  const debug = require('debug')('stuco:model:user:takebadge')
  debug('take badge "' + badgeId + '"')
  debug('size badges ' + this.badges.length)
  this.badges = this.badges.filter((userBadgeId) => {
    return userBadgeId !== badgeId
  })
  debug('size after filter badges ' + this.badges.length)
  // Remove score associated with badge
  return this.removeScore({bid: badgeId})
}

let User = module.exports = mongoose.model('User', UserSchema)
module.exports.schema = UserSchema

module.exports.getUser = function (userId) {
  const debug = require('debug')('stuco:model:user:getuser')
  debug('getting user "' + userId + '"')
  return User.findOne({uid: userId})
}

module.exports.getUsers = () => {
  const debug = require('debug')('stuco:model:user:getusers')
  debug('get users')
  return User.find({})
}

module.exports.createUser = (googleUser) => {
  const debug = require('debug')('stuco:model:user:createUser')
  debug('create user "' + googleUser.sub + '"')
  if (!googleUser.email.endsWith('rsdmo.org')) {
    return Promise.reject(new Error('Google Apps Domain Error'))
  }
  return new User({uid: googleUser.sub, name: googleUser.given_name, nickname: googleUser.given_name, email: googleUser.email, role: 'student'}).giveBadge(0).then((dbUser) => {
    debug('given badge "0" successfully')
    dbUser.save().then((dbUser) => {
      debug('save user succeeded "' + dbUser.uid + '"')
      return Promise.resolve(dbUser)
    }).catch((dbError) => {
      debug('database error saving user')
      logger.error(dbError, {context: 'dbError'})
      return Promise.reject(dbError)
    })
  }).catch((giveBadgeError) => {
    debug('failed to give user badge')
    logger.error(giveBadgeError, {context: 'giveBadgeError'})
    return Promise.reject(giveBadgeError)
  })
}

module.exports.getLeaderboard = () => {
  const debug = require('debug')('stuco:model:user:getleaderboard')
  // TODO: Add parameters for handling limit and index (Show limit places above and below index)
  return new Promise((resolve, reject) => {
    debug('get users')
    User.getUsers().then((users) => {
      debug('get users "%d users"', users.length)
      if (users.length < 1) {
        return resolve([])
      }
      let scores = users.map((user) => {
        return user.getPublicUser()
      })
      debug('sort users by score')
      scores.sort((previousUser, currentUser) => {
        if (previousUser.score > currentUser.score) {
          return -1
        }
        if (previousUser.score < currentUser.score) {
          return 1
        }
        return 0
      })
      return resolve(scores)
    }).catch(reject)
  })
}
