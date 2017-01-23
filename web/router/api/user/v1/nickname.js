'use strict'

const express = require('express')
const permission = require('permission')
const logger = require('winston')
const Router = express.Router
const router = new Router()

// Export all router files for user nickname api (ei get, set)
/**
  * @api {get} /api/user/v1/:googleid/nickname Get a user's nickname
  * @apiVersion 1.0.0
  * @apiName GetName
  * @apiGroup User
  * @apiDescription Returns the nickname of the target user
  *
  * @apiUse AuthParam
  *
  * @apiSuccess {String} name The user's nickname
*/
router.get('/', (req, res) => {
  // Return a user's nickname
  res.send(req.targetUser.nickname)
})

/**
  * @api {put} /api/user/v1/:googleid/nickname Set a user's nickname
  * @apiVersion 1.0.0
  * @apiName SetNickname
  * @apiGroup User
  * @apiDescription Set a new nickname for the target user
  *
  * @apiUse AuthParam
  * @apiPermission teacher
  * @apiPermission developer
  * @apiPermission admin
  * @apiPermission self
  *
  * @apiSuccess {String} name The user's new nickname
*/
router.put('/', permission(['teacher', 'developer', 'admin']), (req, res) => {
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
