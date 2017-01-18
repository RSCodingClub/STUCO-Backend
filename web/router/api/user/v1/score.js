'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()

// Export all router files for user score api (ei give, take)

router.get('/', (req, res) => {
  // Return all of a users badges
  res.send(req.targetUser.getScore().toString())
})

router.get('/all', (req, res) => {
  res.json(req.targetUser.scores)
})

// TODO
// router.put('/score', (req, res) => {
//
// })

module.exports = router
