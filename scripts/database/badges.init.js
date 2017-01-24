const Badge = require('../../models/Badge')
const config = require('../../config')
const debug = require('debug')('stuco:script:initbadges')
const mongoose = require('mongoose')
const badges = require('./badges.json')

debug('mongodb connect to "mongodb://' + config.mongodb.user + ':' + '*******' + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database + '"')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database).then(() => {
  debug('connected')
  Promise.all(badges.map((badge) => {
    return Badge.update({
      bid: badge.bid
    }, badge, {
      upsert: true,
      multi: true,
      runValidators: true
    })
  })).then((dbInfo) => {
    console.log('modified ' + dbInfo.reduce((previous, current, interval) => {
      if (interval === 1) {
        return previous.nModified + current.nModified
      } return previous + current.nModified
    }) + ' badges')
    process.exit(0)
  }).catch((dbError) => {
    throw dbError
  })
}).catch((dbConnectError) => {
  debug('failed to connect', dbConnectError)
  throw dbConnectError
})
