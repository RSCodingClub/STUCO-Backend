'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  // What port to run the webserver on
  PORT: joi.number().integer().min(1).default(80),
  SERVER_ENDPOINT: joi.string()
}).unknown().required())
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  server: {
    port: envVars.PORT,
    endpoint: envVars.SERVER_ENDPOINT
  }
}

module.exports = config
