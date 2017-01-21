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

/**
  * @api {get} /api/badge/v1/ Get a list of badges
  * @apiVersion 1.0.0
  * @apiName GetBadges
  * @apiGroup Badges
  * @apiDescription Returns an array of all badges
  *
  * @apiUse AuthParam
  *
  * @apiSuccess {Object[]} badges List of badges
  * @apiSuccess {Number} badges.bid The badge's id
  * @apiSuccess {String} badges.name The name of the badge
  * @apiSuccess {String} badges.desc The description of the badge
  * @apiSuccess {Strng} badges.earn How the badge is earned
  * @apiSuccess {Number} badges.reward How many points earning the badge will reward
*/
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

/**
  * @api {get} /api/badge/v1/:badgeid Get a specific badge
  * @apiVersion 1.0.0
  * @apiName GetBadge
  * @apiGroup Badges
  *
  * @apiDescription Returns the details on a single badge
  *
  * @apiSuccess {Object} badge List of badge
  * @apiSuccess {Number} badge.bid The badge's id
  * @apiSuccess {String} badge.name The name of the badge
  * @apiSuccess {String} badge.desc The description of the badge
  * @apiSuccess {Strng} badge.earn How the badge is earned
  * @apiSuccess {Number} badge.reward How many points earning the badge will reward
*/
router.get('/:badgeid', (req, res) => {
  const debug = require('debug')('stuco:web:badge:badgeid')
  debug('get targetBadge', req.targetBadge)
  res.json(req.targetBadge)
})

// TODO: Implement potentially
/**
  * @apiIgnore Not implemented yet
  * @api {get} /api/badge/v1/:badgeid Create a new badge
  * @apiVersion 1.0.0
  * @apiName PutBadge
  * @apiGroup Badges
  *
  * @apiDescription Create a new badge
  *
  * @apiParam {Number} badgeid The badges id
  * @apiParam {String} name The name of the badge
  * @apiParam {String} desc The description of the badge
  * @apiParam {Strng} earn How the badge is earned
  * @apiParam {Number} reward How many points earning the badge will reward
*/
router.put('/:badgeid')

module.exports = router
