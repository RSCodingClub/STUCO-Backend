'use strict'

const Event = require('../../../../../models/Event')

let eventIdParam = (req, res, next, eventid) => {
  Event.findOne({
    eid: eventid
  }).then((dbEvent) => {
    if (dbEvent == null) {
      return res.error('Event Not Found', 404)
    }
    req.targetEvent = dbEvent
    next()
  }).catch((dbError) => {
    return res.error('Event Not Found', 404)
  })
}

module.exports = eventIdParam
