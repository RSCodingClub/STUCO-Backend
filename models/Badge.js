const mongoose = require('mongoose')
const Schema = mongoose.Schema

let BadgeSchema = new Schema({
  bid: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    maxlength: 64
  },
  desc: {
    type: String,
    maxlength: 64
  },
  earn: {
    type: String,
    maxlength: 64
  },
  reward: {
    type: Number
  }
})

// Formatting
BadgeSchema.methods.object = function () {
  return {
    bid: this.bid,
    name: this.name,
    desc: this.desc,
    earn: this.earn,
    reward: this.reward
  }
}
BadgeSchema.methods.toString = function () {
  return this.name.toString().trim()
}

let Badge = module.exports = mongoose.model('Badge', BadgeSchema)
module.exports.schema = BadgeSchema

module.exports.getBadges = () => {
  return Badge.find({})
}

module.exports.getBadge = (badgeId) => {
  return Badge.findOne({
    bid: badgeId
  })
}

module.exports.badgeExists = (badgeId) => {
  const debug = require('debug')('stuco:model:badge:exists')
  return new Promise((resolve, reject) => {
    debug('getting badge "%d"', badgeId)
    Badge.getBadge(badgeId).then((badge) => {
      debug('exists ' + Boolean(badge != null))
      return resolve(badge != null)
    }).catch((dbError) => {
      debug('exists false', dbError)
      return resolve(false)
    })
  })
}
