'use strict'

const http = require('http')
const debug = require('debug')('stuco:web:index')
const logger = require('winston')
const mongoose = require('mongoose')
const config = require('../config')
const app = require('./server')

async function startup () {
  try {
    let readyApp = await app
    debug('create httpServer')
    const server = http.createServer(readyApp)

    await dbConnect()
    await listen(server)

    return server
  } catch (initializationError) {
    debug('failed to initialize server app failed to initialize')
    throw initializationError
  }
}

function listen (server) {
  return new Promise((resolve, reject) => {
    server.listen(config.server.port, (serverStartupError) => {
      debug('listening httpServer (pid:%d) on port %d', process.pid, config.server.port)
      if (serverStartupError) {
        logger.error('Error happened during server start', serverStartupError)
        process.exit(1)
        return reject(serverStartupError)
      } else {
        logger.info(`App is listening on port ${config.server.port}`)
        return resolve()
      }
    })
  })
}

async function dbConnect () {
  debug('mongodb connect to "mongodb://' + config.mongodb.user + ':' + '*******' + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database + '"')
  mongoose.Promise = global.Promise
  mongoose.connect('mongodb://' + config.mongodb.user + ':' + config.mongodb.password + '@' + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.database)
  return new Promise((resolve, reject) => {
    mongoose.connection.on('connected', () => {
      return resolve()
    }).on('error', (mongooseConnectionError) => {
      reject(mongooseConnectionError)
    })
  })
}

module.exports = startup()
