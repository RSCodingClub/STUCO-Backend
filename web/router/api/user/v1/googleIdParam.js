'use strict'

const debug = require('debug')('stuco:web:middleware:googleIdParam')
const User = require('../../../../../models/User')

debug('load parser')
const googleIdParam = (req, res, next, googleid) => {
  debug('parse googleid parameter', googleid)
  User.findOne({
    uid: googleid
  }).then((dbUser) => {
    if (dbUser == null) {
      debug('return user failed (not found) "' + googleid + '"')
      return res.error('User Not Found', 404)
    }
    debug('return user succeeded "' + googleid + '"')
    req.targetUser = dbUser
    return next()
  }).catch((dbError) => {
    debug('return user failed "' + googleid + '"', dbError)
    return res.error('User Not Found', 404)
  })
}

module.exports = googleIdParam
