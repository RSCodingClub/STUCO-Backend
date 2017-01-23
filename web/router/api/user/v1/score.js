'use strict'

const express = require('express')
const permission = require('permission')
const logger = require('winston')
const Router = express.Router
const router = new Router()

// Export all router files for user score api (ei give, take)

/**
  * @api {get} /api/user/v1/:googleid/score/all Get total score
  * @apiVersion 1.0.0
  * @apiName GetScore
  * @apiGroup User
  * @apiDescription Returns the total score for the requested user
  *
  * @apiUse AuthParam
  * @apiUse GoogleIdParam
  *
  * @apiSuccess {Number} score The user's total score
*/
router.get('/', (req, res) => {
  res.send(req.targetUser.getScore().toString())
})

/**
  * @api {get} /api/user/v1/:googleid/score/all Get all scores
  * @apiVersion 1.0.0
  * @apiName GetAllScores
  * @apiGroup User
  * @apiDescription Returns the all scores for the requested user
  *
  * @apiUse AuthParam
  * @apiUse GoogleIdParam
  * @apiPermission teacher
  * @apiPermission stuco
  * @apiPermission developer
  * @apiPermission admin
  * @apiPermission self
  *
  * @apiSuccess {Object[]} scores The user's scores
  * @apiSuccess {Number} scores.bid A score's associated badge
  * @apiSuccess {Number} scores.eid A score's associated event
  * @apiSuccess {Number} scores.timestamp The time the score was awarded
  * @apiSuccess {Number} scores.value The number of points the score gave
  * @apiSuccess {String} [scores.type="unknown"] The type of score added
*/
router.get('/all', permission(['teacher', 'stuco', 'developer', 'admin']), (req, res) => {
  res.json(req.targetUser.scores)
})

/**
  * @api {put} /api/user/v1/:googleid/score Give a score
  * @apiVersion 1.0.0
  * @apiName GiveScore
  * @apiGroup User
  * @apiDescription Give a user a score
  *
  * @apiUse AuthParam
  * @apiUse GoogleIdParam
  * @apiPermission developer
  * @apiPermission admin
  *
  * @apiParam {Number} [value=0] The point reward for the score to be added
  * @apiParam {String} [type=unknown] The type of the score
  * @apiParam {Number} [eid=-1] The event id associated with the score
  * @apiParam {Number} [bid=-1] The badge id associated with the score
  * @apiParam {Number} [timestamp=now] The time the score was awarded
  *
  * @apiSuccess {Object[]} scores The user's scores
  * @apiSuccess {Number} scores.bid A score's associated badge
  * @apiSuccess {Number} scores.eid A score's associated event
  * @apiSuccess {Number} scores.timestamp The time the score was awarded
  * @apiSuccess {Number} scores.value The number of points the score gave
  * @apiSuccess {String} [scores.type="unknown"] The type of score added
*/
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

/**
  * @api {delete} /api/user/v1/:googleid/score Take a score
  * @apiVersion 1.0.0
  * @apiName TakeScore
  * @apiGroup User
  * @apiDescription Search and remove a score by parameters
  *
  * @apiUse AuthParam
  * @apiUse GoogleIdParam
  * @apiPermission developer
  * @apiPermission admin
  *
  * @apiParam {Number} [value=0] The point reward for the score to be added
  * @apiParam {String} [type=unknown] The type of the score
  * @apiParam {Number} [eid=-1] The event id associated with the score
  * @apiParam {Number} [bid=-1] The badge id associated with the score
  * @apiParam {Number} [timestamp=now] The time the score was awarded
  * @apiParamExample {json} Remove-Score-From-Badge:
  *     {
  *       "bid": 3
  *     }
  *
  * @apiSuccess {Object[]} scores The user's scores
  * @apiSuccess {Number} scores.bid A score's associated badge
  * @apiSuccess {Number} scores.eid A score's associated event
  * @apiSuccess {Number} scores.timestamp The time the score was awarded
  * @apiSuccess {Number} scores.value The number of points the score gave
  * @apiSuccess {String} [scores.type="unknown"] The type of score added
*/
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
