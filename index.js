// TODO: Start up all application processes

const mongoose = require('mongoose')
const logger = require('winston')
const server = require('./web')

// TODO: Cluster this
server.then(server => {
  // TODO: Do stuff with server object
}).catch((startupError) => {
  // TODO: Handle error, possibly relaunch child process worker
  logger.error(startupError)
  process.exit(1)
})

process.on('warning', (warning) => {
  console.log('warning')
  logger.warn(warning)
})

process.on('uncaughtException', (uncaughtException) => {
  console.log('uncaughtException')
  logger.error(uncaughtException)
  mongoose.disconnect()
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('unhandledRejection')
  logger.warn(reason)
  // application specific logging, throwing an error, or other logic here
})

process.on('SIGINT', () => {
  console.log('Terminating Application')
  logger.log('Terminating application.', () => {
    process.exit(128)
  })
})

process.on('exit', (exitCode) => {
  console.log('Exiting Application')
  mongoose.disconnect()
  mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB')
    logger.log('Exiting application with exitcode', exitCode)
  })
})
