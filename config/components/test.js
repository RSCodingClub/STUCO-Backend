'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  TEST_API_KEY: joi.string(),
  TEST_USER_ID: joi.string()
}).unknown())
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  test: {
    apiKey: envVars.TEST_API_KEY,
    userid: envVars.TEST_USER_ID
  }
}

module.exports = config
