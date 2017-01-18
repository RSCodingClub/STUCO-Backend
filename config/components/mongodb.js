'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  // User to connect to mongodb
  MONGODB_USER: joi.string().default('mongoose'),
  // Password for the user specified
  MONGODB_PASS: joi.string(),
  // URL to connect to for mongodb
  MONGODB_HOST: joi.string().default('127.0.0.1'),
  // Port for the host to connect to
  MONGODB_PORT: joi.number().integer().min(1).default(27017),
  // Which database to use
  MONGODB_DATABASE: joi.string().default('stucoapp')
}).unknown().required())
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  mongodb: {
    user: envVars.MONGODB_USER,
    password: envVars.MONGODB_PASS,
    host: envVars.MONGODB_HOST,
    port: envVars.MONGODB_PORT,
    database: envVars.MONGODB_DATABASE
  }
}

module.exports = config
