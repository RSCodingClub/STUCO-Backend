'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()

const badgeParam = require('./badgeParam')

// Export all router files for user badge api (ei give, take)
router.param('badgeid', badgeParam)

router.get('/', (req, res) => {
  // Return all of a users badges
  res.json(req.targetUser.badges)
})

// TODO
// router.put('/:badgeid', (req, res) => {
//
// })

module.exports = router
