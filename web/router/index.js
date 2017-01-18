'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()
const path = require('path')
const api = require('./api')

// Export all router files here
// URL Base '/'
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/index.html'))
})
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/views/login.html'))
})
router.use('/api', api)

module.exports = router
