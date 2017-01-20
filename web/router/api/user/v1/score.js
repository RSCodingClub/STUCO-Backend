'use strict'

const express = require('express')
const permission = require('permission')
const logger = require('winston')
const Router = express.Router
const router = new Router()

// Export all router files for user score api (ei give, take)

router.get('/', (req, res) => {
  // Return all of a users badges
  res.send(req.targetUser.getScore().toString())
})

router.get('/all', permission(['teacher', 'stuco', 'developer', 'admin']), (req, res) => {
  res.json(req.targetUser.scores)
})

router.put('/', permission(['developer', 'admin']), (req, res) => {
  if (req.isSelf) {
    return res.error('Permission Requirements Not Met')
  }
  let scoreOptions = {
    value: Number(req.body.value) || 0,
    type: req.body.type || 'manual',
    timestamp: req.body.timestamp || null,
    eid: req.body.eid || null,
    bid: req.body.bid || null
  }
  req.targetUser
    .giveScore(scoreOptions)
    .save().then((dbUser) => {
      res.json(dbUser.scores)
    }).catch((dbError) => {
      logger.error(dbError, {context: 'dbError'})
      res.error()
    })
})

router.delete('/', permission(['developer', 'admin']), (req, res) => {
  if (req.isSelf) {
    return res.error('Permission Requirements Not Met')
  }
  req.targetUser.removeScore(req.body)
    .save().then((dbUser) => {
      res.json(dbUser.scores)
    }).catch((dbError) => {
      logger.error(dbError, {context: 'dbError'})
      res.error()
    })
})

module.exports = router
