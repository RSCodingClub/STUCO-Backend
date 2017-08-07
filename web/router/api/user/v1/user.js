'use strict'

const express = require('express')
const permission = require('permission')
const Router = express.Router
const router = new Router()

// Export all router files for user object api (ei details, public, or all)

/**
  * @api {get} /api/user/v1/:googleid Get a specified user
  * @apiVersion 1.0.0
  * @apiName GetUser
  * @apiGroup User
  * @apiDescription Returns the public profile of the requested user
  *
  * @apiUse AuthParam
  * @apiUse GoogleIdParam
  *
  * @apiUse publicUser
*/
router.get(['/', '/public'], (req, res) => {
  // Return the public user
  res.json(req.targetUser.getPublicUser())
})

/**
  * @api {get} /api/user/v1/:googleid/details Get details on specified user
  * @apiVersion 1.0.0
  * @apiName GetDetailedUser
  * @apiGroup User
  * @apiDescription Returns the details profile of the requested user
  *
  * @apiUse AuthParam
  * @apiUse GoogleIdParam
  * @apiPermission teacher
  * @apiPermission stuco
  * @apiPermission developer
  * @apiPermission admin
  * @apiPermission self
  *
  * @apiSuccess {Object} user The user's detailed profile
  * @apiSuccess {String} user.uid The user's unique id
  * @apiSuccess {String} user.name The user's name
  * @apiSuccess {String} user.nickname The user's nickname
  * @apiSuccess {String} user.email The user's email
  * @apiSuccess {Object[]} user.scores The user's scores
  * @apiSuccess {Number} user.scores.bid A score's associated badge
  * @apiSuccess {Number} user.scores.eid A score's associated event
  * @apiSuccess {Number} user.scores.timestamp The time the score was awarded
  * @apiSuccess {Number} user.scores.value The number of points the score gave
  * @apiSuccess {Number[]} user.badges List of badge ids the user has
  * @apiSuccess {Strine} user.role The users current permission role
  * @apiSuccess {String} user.apikey The user's API key
*/
router.get('/details', permission(['teacher', 'stuco', 'developer', 'admin']), (req, res) => {
  // Return more info on the user
  res.json(req.targetUser.exportUser())
})

/**
  * @api {get} /api/user/v1/:googleid/all Get all information on specified user
  * @apiVersion 1.0.0
  * @apiName GetFullUser
  * @apiGroup User
  * @apiDescription Returns the full profile of the requested user
  *
  * @apiUse AuthParam
  * @apiUse GoogleIdParam
  * @apiPermission developer
  * @apiPermission admin
  *
  * @apiSuccess {Object} user The user's full profile
  * @apiSuccess {String} user._id The user's database unique id
  * @apiSuccess {String} user.uid The user's unique id
  * @apiSuccess {String} user.email The user's email
  * @apiSuccess {Number} user.__v The user's version indicator
  * @apiSuccess {Date} user.lastlogin The last time the user successfully authenticated
  * @apiSuccess {Date} user.created When the user first authenticated
  * @apiSuccess {String} user.apikey The user's API key
  * @apiSuccess {Strine} user.role The users current permission role
  * @apiSuccess {Number[]} user.badges List of badge ids the user has
  * @apiSuccess {Object[]} user.scores The user's scores
  * @apiSuccess {Number} user.scores.bid A score's associated badge
  * @apiSuccess {Number} user.scores.eid A score's associated event
  * @apiSuccess {Number} user.scores.timestamp The time the score was awarded
  * @apiSuccess {Number} user.scores.value The number of points the score gave
  * @apiSuccess {String} user.nickname The user's nickname
  * @apiSuccess {String} user.name The user's name
*/
router.get('/all', permission(['developer', 'admin']), (req, res) => {
  // Return all info on the user including some private information
  if (req.isSelf) {
    return res.status(403).error('Permission Requirements Not Met')
  }
  res.json(req.targetUser)
})

module.exports = router
