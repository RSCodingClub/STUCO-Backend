'use strict'
const joi = require('joi')

const {error, value: envVars} = joi.validate(process.env, joi.object({
  // Maximum radius from event location checking is allowed
  LOCATION_MAX_RADIUS: joi.number().min(1).max(9999).default(400),
  // Maximum allowed accuracy to be factored into location
  LOCATION_MAX_ACCURACY: joi.number().min(1).max(9999).default(40)
}).unknown().required())
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  location: {
    maxRadius: envVars.LOCATION_MAX_RADIUS,
    maxAccuracy: envVars.LOCATION_MAX_ACCURACY
  }
}

module.exports = config
