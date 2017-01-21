'use strict'

const express = require('express')
const RateLimit = require('express-rate-limit')
const Router = express.Router
const router = new Router()
const config = require('../../../config')
const user = require('./user')
const bugreport = require('./bugreport')
const badge = require('./badge')
const event = require('./event')

// Export all router files for user api
// URL Base '/api'
router.use(new RateLimit({
  headers: true,
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: config.isDevelopment ? 1500 : 300
}))

router.use('/user', user)
router.use('/bugreport', bugreport)
router.use('/badge', badge)
router.use('/event', event)

module.exports = router
