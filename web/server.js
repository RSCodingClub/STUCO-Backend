'use strict'

const path = require('path')
const debug = require('debug')('stuco:web:server')
const logger = require('winston')
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const jwt = require('express-jwt')
// const passport = require('passport')
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

// morgan, hide if test
if (!config.isTest) {
  app.use(morgan('tiny', {stream: middleware.requestLogger.stream}))
}

// helmet
app.use(helmet())

// permissions
app.set('permission', middleware.permissionHandler.settings)

async function startup () {
  // custom auth and listen for google event updates
  try {
    await Promise.all([ auth.googleCertificates(), middleware.eventListener.init() ])
    debug('init middlewares')
    app.use('/api', jwt({
      secret: auth.jwtHandler.getSecret,
      algorithms: ['RS256'],
      issuer: [
        'https://accounts.google.com', 'accounts.google.com'
      ],
      audience: config.google.oauth.clientId,
      getToken: auth.jwtHandler.getToken
    }), auth.jwtHandler.handleLogin)
    // passport
    // app.use(passport.initialize())
    // if (config.isTest) {
    //   app.use('/api', passport.authenticate(['localapikey', 'jwt'], {session: false}))
    // } else {
    //   app.use('/api', passport.authenticate('jwt', {session: false}))
    // }
    // auth.passportHandler()
    // auth.passportSerializer()
    // Custom middleware
    console.log(middleware.error.inject)
    app.use(middleware.error.inject)

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

    app.use((error, req, res, next) => {
      if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
          error: 'Invalid UserToken',
          errorid: middleware.error.errorCodes['Invalid UserToken'] || -1
        })
      }
      logger.error('Uncaught Express Error - ' + error.name)
      console.error(error)
      return res.send('ppoop')
      // return res.status(500).error(config.env.isDevelopment ? error : null)
    })

    debug('use routers finished')
    return app
  } catch (initializationError) {
    debug('init error')
    throw initializationError
  }
}

module.exports = startup()
