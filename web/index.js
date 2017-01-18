'use strict'

const http = require('http')
const debug = require('debug')('stuco:web:index')
const logger = require('winston')
const mongoose = require('mongoose')
const config = require('../config')
const app = require('./server')

module.exports = new Promise((resolve, reject) => {
  app.then((readyApp) => {
    debug('create httpServer')
    const server = http.createServer(readyApp)
    dbConnect()
    mongoose.connection.on('connected', () => {
      listen(server)
      return resolve(server)
    }).on('error', (mongooseConnectionError) => {
      return reject(mongooseConnectionError)
    })
  }).catch(initializationError => {
    debug('failed to initialize server app failed to initialize')
    return reject(initializationError)
  })
})

let listen = (server) => {
  server.listen(config.server.port, (err) => {
    debug('listening httpServer (pid:%d) on port %d', process.pid, config.server.port)
    if (err) {
      logger.error('Error happened during server start', err)
      process.exit(1)
    } else {
      logger.info(`App is listening on port ${config.server.port}`)
    }
  })
}

let dbConnect = () => {
  debug('mongodb connect to "mongodb://' + config.mongodb.user + ':' + '*******' + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database + '"')
  mongoose.Promise = global.Promise
  return mongoose.connect('mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database)
}
