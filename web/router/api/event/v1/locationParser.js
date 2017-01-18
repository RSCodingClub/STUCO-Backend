
const Location = require('../../../../../models/Location')
const debug = require('debug')('stuco:middleware:event:locationparser')

let parser = (req, res, next) => {
  debug('parsing request')
  if ((req.body.latitude != null && req.body.longitude == null) || (req.body.latitude == null && req.body.longitude != null)) {
    res.error('Both Latitude and Longitude Is Required.')
  } else if ((isNaN(Number(req.body.latitude)) || isNaN(Number(req.body.longitude))) && (req.body.longitude != null && req.body.latitude != null)) {
    res.error('Location Type Should Be Number')
  } else if (req.body.latitude && req.body.longitude) {
    let loc = new Location({
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      accuracy: req.body.accuracy
    })
    loc.validate().then(() => {
      req.location = loc
      next()
    }).catch((validationError) => {
      next(validationError)
    })
  } else {
    next()
  }
}

module.exports = parser
