'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()

// Export all router files for user object api (ei details, public, or all)

router.get(['/', '/public'], (req, res) => {
  // Return the public user
  res.json(req.targetUser.getPublicUser())
})

router.get('/details', (req, res) => {
  // Return more info on the user
  res.json(req.targetUser.exportUser())
})

router.get('/all', (req, res) => {
  // Return all info on the user including some private information
  res.json(req.targetUser)
})

module.exports = router
