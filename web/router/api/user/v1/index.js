'use strict'

const logger = require('winston')
const express = require('express')
const Router = express.Router
const router = new Router()
const User = require('../../../../../models/User')

const googleIdParam = require('./googleIdParam')

const user = require('./user')
const nickname = require('./nickname')
const name = require('./name')
const badge = require('./badge')
const score = require('./score')

// Export all router files for user api (ei leaderboard, nickname, name, score all into their own files)

router.param('googleid', googleIdParam)

/**
  * @apiDefine publicUser [Public User]
  * @apiSuccess {Object} user The user's public profile
  * @apiSuccess {String} user.uid The user's unique id
  * @apiSuccess {String} user.name The user's name
  * @apiSuccess {String} user.nickname The user's nickname
  * @apiSuccess {Number} user.score The user's total score
  * @apiSuccess {Number[]} user.badges List of badge ids the user has
  * @apiSuccess {Strine} user.role The users current permission role
*/

/**
  * @api {get} /api/user/v1/ Get current user
  * @apiVersion 1.0.0
  * @apiName GetSelfUser
  * @apiGroup User
  * @apiDescription Returns the public profile of the currently authenticated user
  *
  * @apiUse AuthParam
  *
  * @apiUse publicUser
*/
router.get('/', (req, res) => {
  console.log('req.user', req.user)
  res.json(req.user.getPublicUser())
})

/**
  * @api {get} /api/user/v1/leaderboard Get the leaderboard
  * @apiVersion 1.0.0
  * @apiName GetLeaderboard
  * @apiGroup User
  * @apiDescription Returns an array of the public profile in order of score
  *
  * @apiUse AuthParam
  *
  * @apiUse publicUser
*/
router.get('/leaderboard', async (req, res) => {
  try {
    let leaderboard = await User.getLeaderboard()
    res.json(leaderboard)
  } catch (getLeaderboardError) {
    logger.error(getLeaderboardError, {context: 'getLeaderboardError'})
    res.status(500).error(getLeaderboardError)
  }
})

router.use('/:googleid/', user)
router.use('/:googleid/nickname', nickname)
router.use('/:googleid/name', name)
router.use(['/:googleid/badge', '/:googleid/badges'], badge)
router.use('/:googleid/score', score)

module.exports = router
