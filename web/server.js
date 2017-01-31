'use strict'

const path = require('path')
const debug = require('debug')('stuco:web:server')
const logger = require('winston')
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const passport = require('passport')
const methodOverride = require('method-override')
const app = express()

const config = require('../config')
const auth = require('./auth')
const middleware = require('./middleware')
const router = require('./router')

debug('use middleware start')
// bodyParser
app.use(bodyParser.urlencoded({extended: 'true'}))
app.use(bodyParser.json())
app.use(bodyParser.json({type: 'application/vnd.api+json'}))

// methodOverride
app.use(methodOverride())

// morgan
if (!config.isTest) {
  app.use(morgan('tiny', {stream: middleware.requestLogger.stream}))
}

// helmet
app.use(helmet())

app.use((error, req, res, next) => {
  logger.error(error)
  res.error(error, 500)
})

// permissions
app.set('permission', middleware.permissionHandler.settings)

module.exports = new Promise((resolve, reject) => {
  // custom auth and listen for google event updates
  Promise.all([auth.googleCertificates(), middleware.eventListener.init()]).then((responses) => {
    debug('init middlewares')
    // passport
    app.use(passport.initialize())
    app.use('/api', passport.authenticate('jwt', {session: false}))
    auth.passportHandler()
    auth.passportSerializer()
    // Custom middleware
    app.use(middleware.error)

    debug('use middleware finished')

    // NOTE: Possibly use config for custom eventlistener path
    app.post('/eventlistener', middleware.eventListener.handler)
    debug('listening for event updates from google')

    // Define routers
    debug('use routers start')
    app.use('/', router)
    // Static files
    debug('use static files')
    app.use([
      '/static', '/res'
    ], express.static(path.join(__dirname, '../public')))
    debug('use routers finished')
    return resolve(app)
  }).catch((initializationError) => {
    debug('init error')
    return reject(initializationError)
  })
})
