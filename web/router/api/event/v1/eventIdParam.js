'use strict'

const Event = require('../../../../../models/Event')

// NOTE: This applies to all route handlers that are asynchronous, express doesn't handle async routes the best so if the route is a middleware then it shouldn't return a promise
let eventIdParam = async (req, res, next, eventid) => {
  try {
    let dbEvent = await Event.findOne({
      eid: eventid
    })
    if (dbEvent == null) {
      return res.status(404).error('Event Not Found')
    }
    req.targetEvent = dbEvent
    return next()
  } catch (e) {
    return res.status(404).error('Event Not Found')
  }
}

module.exports = eventIdParam
