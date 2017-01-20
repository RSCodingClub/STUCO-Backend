'use strict'

const express = require('express')
const permission = require('permission')
const Router = express.Router
const router = new Router()

// Export all router files for user object api (ei details, public, or all)

router.get(['/', '/public'], (req, res) => {
  // Return the public user
  res.json(req.targetUser.getPublicUser())
})

router.get('/details', permission(['teacher', 'stuco', 'developer', 'admin']), (req, res) => {
  // Return more info on the user
  res.json(req.targetUser.exportUser())
})

router.get('/all', permission(['developer', 'admin']), (req, res) => {
  // Return all info on the user including some private information
  if (req.isSelf) {
    return res.error('Permission Requirements Not Met')
  }
  res.json(req.targetUser)
})

module.exports = router
