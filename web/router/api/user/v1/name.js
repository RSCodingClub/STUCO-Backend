'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()

// Export all router files for user name api (ei get, set)

router.get('/', (req, res) => {
  // Return a user's name
  res.send(req.targetUser.name)
})

// TODO
// router.put('/', (req, res) => {
//
// })

module.exports = router
