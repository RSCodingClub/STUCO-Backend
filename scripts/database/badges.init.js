const Badge = require('../../models/Badge')
const config = require('../../config')
const debug = require('debug')('stuco:script:initbadges')
const mongoose = require('mongoose')
const badges = require('./badges.json')

debug('mongodb connect to "mongodb://' + config.mongodb.user + ':' + '*******' + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database + '"')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database).then(() => {
  debug('connected')
  Badge.collection.insertMany(badges, (dbError, dbInfo) => {
    if (dbError) {
      throw dbError
    }
    debug('inserted or replaced %d badges', dbInfo.insertedCount)
    process.exit(0)
  })
}).catch((dbConnectError) => {
  debug('failed to connect', dbConnectError)
  process.exit(1)
  throw dbConnectError
})
