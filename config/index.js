const config = require('./config')
const winston = require('winston')
require('winston-papertrail')

// Do config application modifications here (ie: set logging level, etc)

winston.configure({
  transports: [new winston.transports.Console({
    level: config.logger.level,
    colorize: true,
    timestamp: true,
    silent: !config.logger.enabled
  })]
})
winston.add(winston.transports.File, {
  name: 'error-log',
  level: 'error',
  colorize: false,
  timestamp: true,
  json: true,
  filename: 'error.log'
})
.add(winston.transports.File, {
  name: 'requests-log',
  level: 'verbose',
  colorize: false,
  timestamp: true,
  json: true,
  filename: 'requests.log'
}).add(winston.transports.Papertrail, {
  level: config.isDevelopment ? 'silly' : 'warn',
  host: config.logger.papertrail.url,
  port: config.logger.papertrail.port,
  colorize: true,
  hostname: 'win64',
  program: 'stuco-backend-' + config.env,
  logFormat: (level, message) => {
    return new Date().toISOString() + ' - ' + level + ': ' + message
  }
})

winston.info('All required configurations have been configured.')

module.exports = config
