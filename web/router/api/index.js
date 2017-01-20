'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()
const user = require('./user')
const bugreport = require('./bugreport')
const badge = require('./badge')
const event = require('./event')

// Export all router files for user api
// URL Base '/api'
router.use('/user', user)
router.user('/bugreport', bugreport)
router.use('/badge', badge)
router.use('/event', event)

module.exports = router
