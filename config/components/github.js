'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  GITHUB_USER: joi.string().required(),
  GITHUB_ACCESS_TOKEN: joi.string().required()
}).unknown().required())
if (error) throw new Error(`Config validation error: ${error.message}`)

const config = {
  github: {
    username: envVars.GITHUB_USER,
    access_token: envVars.GITHUB_ACCESS_TOKEN
  }
}

module.exports = config
