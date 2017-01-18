'use strict'

const express = require('express')
const Router = express.Router
const router = new Router()
const config = require('../../../../../config')
const Evnt = require('../../../../../models/Event')
const eventIdParam = require('./eventIdParam')
const locationParser = require('./locationParser')
const checkin = require('./checkin')

// Export all router files for badge api (ei add badge, get badge, and get badges all into their own files)
// Also add middleware for parsing the URL parameter for badgeid
router.param('eventid', eventIdParam)
router.use(locationParser)

router.get(['/', '/:limit(\\d+)/:index(\\d+)'], (req, res) => {
  let limit = Number(req.params.limit)
  let index = Number(req.params.index)
  limit = isNaN(limit) ? undefined : parseInt(limit)
  index = isNaN(index) ? undefined : parseInt(index)
  Evnt.getActiveEvents(limit, index).then((events) => {
    res.json(events.map((evnt) => {
      return evnt.getPublicEvent()
    }))
  }).catch((dbError) => {
    // NOTE: We don't want to send detailed database information to the end user
    res.error(dbError)
  })
})

router.post(['/', '/:limit(\\d+)/:index(\\d+)'], (req, res) => {
  let limit = Number(req.params.limit)
  let index = Number(req.params.index)
  limit = isNaN(limit) ? undefined : parseInt(limit)
  index = isNaN(index) ? undefined : parseInt(index)
  Evnt.getActiveEvents(limit, index).then((events) => {
    res.json(events.map((evnt) => {
      let e = evnt.getPublicEvent()
      e.onlocation = evnt.location.distanceTo(req.location) < config.location.maxAccuracy
      e.ontime = new Date(evnt.start).getTime() < Date.now() && new Date(evnt.end).getTime() > Date.now()
      e.attending = evnt.userAttending(req.user)
      return e
    }))
  }).catch((dbError) => {
    // NOTE: We don't want to send detailed database information to the end user
    res.error(dbError)
  })
})

router.post('/:eventid/checkin', checkin)

module.exports = router
