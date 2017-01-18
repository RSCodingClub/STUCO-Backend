'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  GOOGLE_API_KEY: joi.string().required(),
  GOOGLE_CALENDAR_ID: joi.string().required(),
  GOOGLE_CLIENT_ID: joi.string().required(),
  GOOGLE_CLIENT_SECRET: joi.string().required(),
  GOOGLE_SERVICE_CLIENT_EMAIL: joi.string().required(),
  GOOGLE_SERVICE_CLIENT_KEY: joi.string().required()
}).unknown().required())
if (error) throw new Error(`Config validation error: ${error.message}`)

const config = {
  google: {
    apiKey: envVars.GOOGLE_API_KEY,
    calendarId: envVars.GOOGLE_CALENDAR_ID,
    oauth: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET
    },
    serviceAccount: {
      clientEmail: envVars.GOOGLE_SERVICE_CLIENT_EMAIL,
      clientKey: envVars.GOOGLE_SERVICE_CLIENT_KEY
    }
  }
}

module.exports = config
