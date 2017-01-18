
const mongoose = require('mongoose')
const request = require('request-promise-native')
const config = require('../config')

let LocationSchema = new mongoose.Schema({
  address: {
    type: String
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  accuracy: {
    type: Number,
    default: config.location.maxAccuracy / 2,
    max: config.location.maxAccuracy,
    min: 0
  }
})

LocationSchema.pre('validate', function (next) {
  const debug = require('debug')('stuco:model:location:prevalidate:location')
  debug('schema address handler')
  // Has address but neither coordinate
  this.accuracy = Math.min(Math.max(this.accuracy, 1), config.location.maxAccuracy)
  if (this.address && (this.latitude == null || this.longitude == null)) {
    debug('has address without location')
    request({
      uri: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(this.address) + '&key=' + config.google.apiKey,
      method: 'GET',
      json: true
    }).then((data) => {
      debug('successfully retrieved location from address')
      if (data.status !== 'OK') {
        return next(new Error('Events Require a Location'))
      }
      this.address = data.results[0].formatted_address
      let locationData = data.results[0].geometry.location
      this.latitude = locationData.lat
      this.longitude = locationData.lng
      return next()
    }).catch((googleError) => {
      debug('failed to retrieve location from address')
      if (!(googleError instanceof Error)) {
        googleError = new Error(googleError)
      }
      return next(googleError)
    })
  } else if (this.address == null && this.latitude == null && this.longitude == null) {
    debug('attempting to create event without any location data')
    // NOTE: Possibly just set to some default event information
    return next(new Error('Events Require a Location'))
  } else {
    return next()
  }
})

// Used to add timezone property to location if needed
// LocationSchema.pre('validate', function (next) {
//   const debug = require('debug')('stuco:model:location:prevalidate:timezone')
//   debug('schema timezone handler')
//   if (this.latitude && this.longitude) {
//     debug('has location')
//     request({
//       uri: `https://maps.googleapis.com/maps/api/timezone/json?location=${this.latitude},${this.longitude}&timestamp=${Date.now()}&key=${config.google.apiKey}`,
//       method: 'GET',
//       json: true
//     }).then((data) => {
//       debug('successfully retrieved timezone from location')
//       this.timezone.dstOffset = data.dstOffset
//       this.timezone.timeZoneId = data.timeZoneId
//       this.timezone.timeZoneName = data.timeZoneName
//       return next()
//     }).catch((googleError) => {
//       debug('failed to retrieve timezone from location')
//       return next(googleError)
//     })
//   }
//   return next()
// })

LocationSchema.methods.toString = function () {
  return this.address || '(' + this.latitude + ' ,' + this.longitude + ')'
}

LocationSchema.methods.distanceTo = function (location) {
  const debug = require('debug')('stuco:model:location:distanceto')
  debug('distance to ' + location + ' from ' + this)
  if (location.hasOwnProperty('longitude') == null || location.hasOwnProperty('latitude') == null || location.hasOwnProperty('accuracy') == null) {
    debug('distance to location is invalid')
    throw new Error('Invalid Location Object')
  }
  let earthRadius = 6.371e6
  let deltaLatitude = Math.abs(location.latitude - this.latitude) * (Math.PI / 180)
  let deltaLongitude = Math.abs(location.longitude - this.longitude) * (Math.PI / 180)
  let relativeAngle = Math.pow(Math.sin(deltaLatitude / 2), 2) +
              Math.cos((this.latitude) * (Math.PI / 180)) * Math.cos((location.latitude) * (Math.PI / 180)) *
              Math.pow(Math.sin(deltaLongitude / 2), 2)
  let absoluteAngle = 2 * Math.atan2(Math.sqrt(relativeAngle), Math.sqrt(1 - relativeAngle))
  let distance = earthRadius * absoluteAngle
  return distance
}

module.exports = mongoose.model('Location', LocationSchema)
module.exports.schema = LocationSchema
