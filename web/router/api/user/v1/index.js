'use strict'

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

router.get('/', (req, res) => {
  res.json(req.user.getPublicUser())
})

router.get('/leaderboard', (req, res) => {
  User.getLeaderboard().then((leaderboard) => {
    res.json(leaderboard)
  }).catch((err) => {
    // NOTE: In production we will won't want to log the error message directly
    res.error(err, 500)
  })
})

router.use('/:googleid/', user)
router.use('/:googleid/nickname', nickname)
router.use('/:googleid/name', name)
router.use(['/:googleid/badge', '/:googleid/badges'], badge)
router.use('/:googleid/score', score)

module.exports = router
