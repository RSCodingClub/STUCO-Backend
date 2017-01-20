'use strict'

const express = require('express')
const permission = require('permission')
const logger = require('winston')
const Router = express.Router
const router = new Router()

// Export all router files for user name api (ei get, set)

router.get('/', (req, res) => {
  // Return a user's name
  res.send(req.targetUser.name)
})

router.put('/', permission(['teacher', 'developer', 'admin']), (req, res) => {
  // Don't allow users to change their own name
  if (req.isSelf) {
    res.error('Permission Requirements Not Met')
  }
  if (req.body.name == null) {
    return res.error('Body Parameters Not Met')
  }
  // NOTE: Potentially install a profanity filter
  req.targetUser.name = req.body.name.toString().trim()
  req.targetUser.save().then((dbUser) => {
    return res.send(req.targetUser.name)
  }).catch((dbError) => {
    logger.error(dbError, {content: 'dbError'})
    return res.error()
  })
})

module.exports = router
