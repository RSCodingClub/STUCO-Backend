'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()
const v1 = require('./v1')

// Export all router files for event api
// URL Base '/api/badge'
router.use('/v1', v1)

module.exports = router
