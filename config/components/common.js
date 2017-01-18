'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  NODE_ENV: joi.string().allow(['development', 'production', 'test']).required()
}).unknown().required())
if (error) throw new Error(`Config validation error: ${error.message}`)

const config = {
  env: envVars.NODE_ENV,
  isTest: envVars.NODE_ENV === 'test',
  isDevelopment: envVars.NODE_ENV === 'development'
}

module.exports = config
