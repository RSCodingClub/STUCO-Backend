'use strict'

const debug = require('debug')('stuco:web:middleware:badgeParam')
const Badge = require('../../../../../models/Badge')

debug('load parser')
const badgeParam = (req, res, next, badgeid) => {
  debug('parse badgeid parameter', badgeid)
  Badge.findOne({
    bid: badgeid
  }).then((dbBadge) => {
    if (dbBadge == null) {
      debug('return badge failed (not found) "%s"', badgeid)
      return res.status(404).error('Badge Not Found')
    }
    debug('return badge succeeded "%s"', badgeid) // Possibly print out badge object
    req.targetBadge = dbBadge
    return next()
  }).catch((dbError) => {
    debug('return badge failed', badgeid, dbError)
    return res.status(404).error('Badge Not Found')
  })
}

module.exports = badgeParam
