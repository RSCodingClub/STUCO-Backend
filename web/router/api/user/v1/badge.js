'use strict'

const express = require('express')
const permission = require('permission')
const logger = require('winston')
const Router = express.Router
const router = new Router()

const badgeParam = require('./badgeParam')

// Export all router files for user badge api (ei give, take)
router.param('badgeid', badgeParam)

router.get('/', (req, res) => {
  // Return all of a users badges
  res.json(req.targetUser.badges)
})

router.put('/:badgeid', permission(['developer', 'admin']), (req, res) => {
  if (req.isSelf) {
    return res.error('Permission Requirements Not Met')
  }
  if (req.targetUser.hasBadge(req.targetBadge.bid)) {
    return res.error('User Already Has Badge')
  }
  req.targetUser
    .giveBadge(req.targetBadge.bid)
    .then((dbUser) => {
      dbUser.save().then((dbUser) => {
        res.json(dbUser.badges)
      }).catch((dbError) => {
        logger.error(dbError, {context: 'dbError'})
        res.error()
      })
    })
    .catch((giveBadgeError) => {
      res.error('Failed to Give User Badge', 500)
    })
})

router.delete('/:badgeid', permission(['developer', 'admin']), (req, res) => {
  if (req.isSelf) {
    return res.error('Permission Requirements Not Met')
  }
  if (!req.targetUser.hasBadge(req.targetBadge.bid)) {
    return res.error('User Doesn\'t Have Badge')
  }
  req.targetUser
    .takeBadge(req.targetBadge.bid)
    .removeScore({bid: req.targetBadge.bid})
    .save().then((dbUser) => {
      return res.json(dbUser.badges)
    }).catch((dbError) => {
      logger.error(dbError, {context: 'dbError'})
      return res.error()
    })
})

module.exports = router
