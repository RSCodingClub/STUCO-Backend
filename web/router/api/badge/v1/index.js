'use strict'

const express = require('express')
const logger = require('winston')
const Badge = require('../../../../../models/Badge')
const Router = express.Router
const router = new Router()

const badgeIdParam = require('./badgeIdParam')

// Export all router files for badge api (ei add badge, get badge, and get badges all into their own files)
// Also add middleware for parsing the URL parameter for badgeid
router.param('badgeid', badgeIdParam)

router.get('/', (req, res) => {
  const debug = require('debug')('stuco:web:badge:all')
  Badge.getBadges().then((dbBadges) => {
    debug('succeeded database request (%d badges)', dbBadges.length)
    if (dbBadges == null) {
      return res.json([])
    }
    return res.json(dbBadges)
  }).catch((dbError) => {
    debug('failed database request')
    logger.error(dbError, {context: dbError})
    return res.error()
  })
})

router.get('/:badgeid', (req, res) => {
  const debug = require('debug')('stuco:web:badge:badgeid')
  debug('get targetBadge', req.targetBadge)
  res.json(req.targetBadge)
})

router.put('/:badgeid')

module.exports = router
