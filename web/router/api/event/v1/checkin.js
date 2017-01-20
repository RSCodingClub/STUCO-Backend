'use strict'

const logger = require('winston')
// const Evnt = require('../../../../../models/Event')
const config = require('../../../../../config')

// Checkin Handler

let handler = (req, res) => {
  if (req.targetEvent.userAttending(req.user)) {
    return res.error('Already Checked In', 400)
  }
  if (new Date(req.targetEvent.start).getTime() < Date.now() && new Date(req.targetEvent.end).getTime() > Date.now()) {
    try {
      if (req.targetEvent.location.distanceTo(req.location) > config.location.maxAccuracy) {
        return res.error('Not At Event Location', 400)
      }
      // Add user to attendees
      req.targetEvent.attendees.push(req.user)
      // Save event with new attendee
      req.targetEvent.save().then((dbEvent) => {
        // TODO: Give badge based on category to user
        // Give score to user
        req.user.giveScore({
          value: dbEvent.reward,
          type: 'event',
          eid: dbEvent.eid
        }).save().then((dbUser) => {
          return res.json(dbUser.getPublicUser())
        }).catch((dbError) => {
          // Failed to give user new score
          logger.error(dbError, {'context': 'dbError'})
          return res.error()
        })
      }).catch((dbSaveError) => {
        logger.error(dbSaveError, {'context': 'dbError'})
        return res.error()
      })
    } catch (locationError) {
      return res.error('Invalid Location Data')
    }
  } else {
    return res.error('Not During Event Time')
  }
}

module.exports = handler
