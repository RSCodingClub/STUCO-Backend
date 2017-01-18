'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()

// Export all router files for user nickname api (ei get, set)

router.get('/', (req, res) => {
  // Return a user's nickname
  res.send(req.targetUser.nickname)
})

// TODO
// router.put('/', (req, res) => {
//
// })

module.exports = router
