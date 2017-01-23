'use strict'

const express = require('express')
const permission = require('permission')
const logger = require('winston')
const Router = express.Router
const router = new Router()

// Export all router files for user name api (ei get, set)

/**
  * @api {get} /api/user/v1/:googleid/name Get a user's name
  * @apiVersion 1.0.0
  * @apiName GetName
  * @apiGroup User
  * @apiDescription Returns the name of the target user
  *
  * @apiUse AuthParam
  *
  * @apiSuccess {String} name The user's name
*/
router.get('/', (req, res) => {
  // Return a user's name
  return res.send(req.targetUser.name)
})

/**
  * @api {put} /api/user/v1/:googleid/name Set a user's name
  * @apiVersion 1.0.0
  * @apiName SetName
  * @apiGroup User
  * @apiDescription Set a new name for the target user
  *
  * @apiUse AuthParam
  * @apiPermission teacher
  * @apiPermission developer
  * @apiPermission admin
  *
  * @apiSuccess {String} name The user's new name
*/
router.put('/', permission(['teacher', 'developer', 'admin']), (req, res) => {
  // Don't allow users to change their own name
  if (req.isSelf) {
    return res.error('Permission Requirements Not Met')
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
