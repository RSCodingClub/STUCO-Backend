'use strict'

const express = require('express')
const Badge = require('../../../../../models/Badge')
const Router = express.Router
const router = new Router()

const badgeIdParam = require('./badgeIdParam')

// Export all router files for badge api (ei add badge, get badge, and get badges all into their own files)
// Also add middleware for parsing the URL parameter for badgeid
router.param('badgeid', badgeIdParam)

router.get('/', (req, res) => {
  res.send('You are in the badge v1 router')
})

router.get(['/badges', '/all'], (req, res) => {
  const debug = require('debug')('stuco:web:badge:all')
  Badge.getBadges().then((dbBadges) => {
    debug('succeeded database request (%d badges)', dbBadges.length)
    if (dbBadges == null) {
      return res.json([])
    }
    res.json(dbBadges)
  }).catch((dbError) => {
    debug('failed database request', dbError)
    // NOTE: In production we will won't want to log the error message directly
    res.error(dbError)
  })
})

router.get(['/getbadge/:badgeid', '/:badgeid'], (req, res) => {
  const debug = require('debug')('stuco:web:badge:badgeid')
  debug('get targetBadge', req.targetBadge)
  res.json(req.targetBadge)
})

module.exports = router
