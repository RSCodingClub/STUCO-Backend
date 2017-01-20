'use strict'

const express = require('express')
const permission = require('permission')
const logger = require('winston')
const Router = express.Router
const router = new Router()

// Export all router files for user nickname api (ei get, set)

router.get('/', (req, res) => {
  // Return a user's nickname
  res.send(req.targetUser.nickname)
})

router.put('/', permission(['teacher', 'developer', 'admin']), (req, res) => {
  // NOTE: Don't allow users to change their own nickname, this may potentially change after release with a profanity filter
  if (req.isSelf) {
    return res.error('Permission Requirements Not Met')
  }
  if (req.body.nickname == null) {
    return res.error('Body Parameters Not Met')
  }
  // NOTE: Potentially install a profanity filter
  req.targetUser.nickname = req.body.nickname.toString().trim()
  req.targetUser.save().then((dbUser) => {
    return res.send(req.targetUser.nickname)
  }).catch((dbError) => {
    logger.error(dbError, {content: 'dbError'})
    return res.error()
  })
})

module.exports = router
