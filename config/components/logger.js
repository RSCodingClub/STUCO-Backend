'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  // Amount of log messages to be logged
  LOGGER_LEVEL: joi.string().allow([
    'error',
    'warn',
    'info',
    'verbose',
    'debug',
    'silly'
  ]).default('info'),
  // Whether or not to log at all
  LOGGER_ENABLED: joi.boolean().truthy('TRUE').truthy('true').falsy('FALSE').falsy('false').default(true),
  PAPERTRAIL_URL: joi.string(),
  PAPERTRAIL_PORT: joi.number().min(1).max(65535)
}).unknown().required())
if (error) throw new Error(`Config validation error: ${error.message}`)

const config = {
  logger: {
    level: envVars.LOGGER_LEVEL,
    enabled: envVars.LOGGER_ENABLED,
    papertrail: {
      url: envVars.PAPERTRAIL_URL,
      port: envVars.PAPERTRAIL_PORT
    }
  }
}

module.exports = config
