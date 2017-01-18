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
      return require('crypto').randomBytes(24).toString('base64')
    }
  },
  created: {
    type: Date,
    default: new Date()
  },
  lastlogin: {
    type: Date,
    default: new Date()
  }
})

UserSchema.pre('save', function (next) {
  const debug = require('debug')('stuco:model:user:presave')
  debug('adding updated_at, created_at, and lastlogin parameters to user')
  this.updated_at = new Date()
  if (!this.created_at) {
    this.created_at = new Date()
    this.lastlogin = new Date()
  }
  return next()
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
  return {uid: this.uid, name: this.name, nickname: this.nickname, score: this.getScore(), badges: this.badges}
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
UserSchema.methods.hasScore = function (scoreProperty, propertyValue) {
  const debug = require('debug')('stuco:model:user:hasscore')
  // Assume scoreProperty is timestamp if only one argument is passed
  if (propertyValue == null) {
    propertyValue = scoreProperty
    scoreProperty = 'timestamp'
  }
  debug('called with ' + scoreProperty + ' === ' + propertyValue)
  return Boolean(this.scores.filter((score) => { return score[scoreProperty] === propertyValue }).length)
}
UserSchema.methods.giveScore = function (options) {
  const debug = require('debug')('stuco:model:user:givescore')
  let self = this
  let Score = function (options) {
    if (!isNaN(Number(options.value))) {
      this.value = parseInt(options.value)
    } else {
      this.value = 0
    }
    if (options.timestamp) {
      this.timestamp = options.timestamp
    } else {
      this.timestamp = Date.now()
    }
    if (self.hasScore('timestamp', this.timestamp)) {
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
    if (options.type === 'badge' || options.bid !== undefined) {
      this.bid = options.bid
    } else {
      this.bid = -1
    }
    return {
      value: this.value,
      type: this.type,
      timestamp: this.timestamp,
      eid: this.eid,
      bid: this.bid
    }
  }
  let score = Score(options)
  debug('giving "' + this.uid + '" ' + score.value + ' points')
  debug('pushing score object %o', score)
  this.scores.push(score)
  return this.save()
  // if (score.value < 0) {
  //   debug('score is negative checking to take badges')
  //   // Check to see if we need to remove and badges from score decrease
  //   if (this.getScore() < 100 && this.hasBadge(29)) {
  //     debug('score is less than 100 taking badge 29')
  //     this.takeBadge(29)
  //   }
  //   if (this.getScore() < 50 && this.hasBadge(22)) {
  //     debug('score is less than 50 taking badge 22')
  //     this.takeBadge(22)
  //   }
  //   return this.save()
  // } else if (score.value > 0) {
  //   debug('score is positive checking to give badge')
  //   // Check to see if we need to give new badges from score increase
  //   if (this.getScore() >= 50) {
  //     debug('score is greater than 50 giving badge 22')
  //     this.giveBadge(22).then(() => {
  //       if (this.getScore() >= 100 && !this.hasBadge(29)) {
  //         debug('score is greater than 100 giving badge 29')
  //         return this.giveBadge(29)
  //       } else {
  //         debug('score is less than 100 skipping giving badge 29')
  //         return this.save()
  //       }
  //     }).catch((badgeError) => {
  //       debug('failed to give user badge ' + 22 + ' ' + badgeError.message)
  //       return Promise.reject(badgeError)
  //     })
  //   } else {
  //     debug('score is less than 50 skipping badge checks')
  //     let r = this.save()
  //     return r
  //   }
  // } else {
  //   debug('score is 0 not checking to give or take badges')
  //   return this.save()
  // }
  // BUG: Fix this so it works (results in a loop of giving badges and testing if has badge already)
  // TODO: Give badge 22 if score is >= 50, give badge 29 if score is >= 100 and take each if less than required.
  // debug('checking points for point badges (currentscore: %d)', self.getScore())
  // return new Promise((resolve, reject) => {
  //   // Badge for 50 points
  //   if (self.getScore() >= 50) {
  //     debug('score is greater than 50')
  //     self.giveBadge(22).then(() => {
  //       // Badge for 100 points
  //       if (self.getScore() >= 100) {
  //         debug('score is greater than 100')
  //         self.giveBadge(29).then(() => {
  //           return resolve()
  //         }).catch((dbError) => {
  //           debug('failed to give badge 29', dbError)
  //           return reject(dbError)
  //         })
  //       } else {
  //         debug('score is less than 100 taking badge 29')
  //         self.takeBadge(29)
  //         return resolve()
  //       }
  //     }).catch((dbError) => {
  //       debug('failed to give badge 22', dbError)
  //       return reject(dbError)
  //     })
  //   } else {
  //     debug('score is less than 50 taking badge 22')
  //     self.takeBadge(22)
  //     return resolve()
  //   }
  // })
}
UserSchema.methods.removeScore = function (scoreProperty, propertyValue) {
  const debug = require('debug')('stuco:model:user:removescore')
  // Assume scoreProperty is timestamp if only one argument is passed
  if (propertyValue == null) {
    propertyValue = scoreProperty
    scoreProperty = 'timestamp'
  }
  debug('score length before removal', this.scores.length)
  // Remove all scores matching parameters
  this.scores = this.scores.filter((score) => { return score[scoreProperty] !== propertyValue })
  debug('score length after removal', this.scores.length)
  if (this.getScore() <= 50 && this.hasBadge(22)) {
    debug('score is less than 50 taking badge 22')
    this.takeBadge(22)
  }
  if (this.getScore() <= 100 && this.hasBadge(29)) {
    debug('score is less than 100 taking badge 29')
    this.takeBadge(29)
  }
  return this
}
UserSchema.methods.getScore = function () {
  const debug = require('debug')('stuco:model:user:getscore')
  debug('getting %d scores from "%s"', this.scores.length, this.uid)
  return this.scores.reduce((previous, current) => ({value: previous.value + current.value})).value
}

// Badges
UserSchema.methods.hasBadge = function (badgeId) {
  const debug = require('debug')('stuco:model:user:hasbadge')
  debug('getting badge "%d" from %s', badgeId, this.uid)
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
      return reject(new Error('Failed to Give User Badge'))
    } else {
      debug('success user does not have badge "' + badgeId + '"')
      Badge.badgeExists(badgeId).then((exists) => {
        debug('badge exists (' + exists + ')')
        if (exists) {
          Badge.getBadge(badgeId).then((badge) => {
            this.badges.push(badge.bid)
            debug('giving badge reward')
            return this.giveScore({
              type: 'badge',
              value: badge.reward,
              bid: badgeId
            }).then(() => {
              return resolve(this)
            }).catch((giveScoreError) => {
              debug('give score error')
              return reject(giveScoreError)
            })
          }).catch((dbError) => {
            debug('database error retrieving badge')
            return reject(dbError)
          })
        } else {
          return reject(new Error('Badge Not Found'))
        }
      })
    }
  })
}
UserSchema.methods.takeBadge = function (badgeId) {
  const debug = require('debug')('stuco:model:user:takebadge')
  debug('take badge "%d"', badgeId)
  debug('size badges %d', this.badges.length)
  this.badges = this.badges.filter((userBadgeId) => { return userBadgeId !== badgeId })
  debug('size after filter badges %d', this.badges.length)
  return this.removeScore('bid', badgeId)
}

let User = module.exports = mongoose.model('User', UserSchema)
module.exports.schema = UserSchema

module.exports.getUser = function (userId) {
  const debug = require('debug')('stuco:model:user:getuser')
  debug('getting user "' + userId + '"')
  return User.findOne({uid: userId})
}

module.exports.userExists = (userId) => {
  const debug = require('debug')('stuco:model:user:exists')
  return new Promise((resolve) => {
    debug('getting user "%d"', userId)
    User.getUser(userId).then((user) => {
      debug('exists ' + Boolean(user != null))
      return resolve(user != null)
    }).catch((dbError) => {
      debug('exists false', dbError)
      return resolve(false)
    })
  })
}

module.exports.getUsers = () => {
  const debug = require('debug')('stuco:model:user:getusers')
  debug('get users')
  return User.find({})
}

module.exports.createUser = (googleUser) => {
  const debug = require('debug')('stuco:model:user:createUser')
  // FIXME: I might not work, just do some testing to make sure
  // This has to do with give score and its many problems with score based badges
  let user = new User({
    uid: googleUser.sub,
    name: googleUser.name,
    nickname: googleUser.given_name,
    email: googleUser.email,
    role: 'student'
  })
  debug('create user "' + googleUser.sub + '"')
  if (!googleUser.email.endsWith('rsdmo.org')) {
    return Promise.reject(new Error('Google Apps Domain Error'))
  }
  return user.giveBadge(0).then((dbUser) => {
    debug('given badge "0" successfully')
    debug('save user succeeded "' + dbUser.uid + '"')
    return Promise.resolve(dbUser)
  }).catch((dbError) => {
    debug('database error saving user')
    logger.error(dbError)
    return Promise.reject(dbError)
  })
}

module.exports.getLeaderboard = () => {
  const debug = require('debug')('stuco:model:user:getleaderboard')
  // TODO: Add parameters for handling limit and index (Show limit places above and below index)
  let scores = []
  return new Promise((resolve, reject) => {
    debug('get users')
    User.getUsers().then((users) => {
      debug('get users "%d users"', users.length)
      if (users.length > 0) {
        users.forEach(function (user) {
          scores.push(user.getPublicUser())
        })
        debug('sort users by score')
        scores.sort((previousUser, currentUser) => {
          if (previousUser.score > currentUser.score) return -1
          if (previousUser.score < currentUser.score) return 1
          return 0
        })
      }
      return resolve(scores)
    }).catch(reject)
  })
}
