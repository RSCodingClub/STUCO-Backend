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
        // Give score to user
        let score = req.user.giveScore({
          value: dbEvent.reward,
          type: 'event',
          eid: dbEvent.eid
        })
        score.then((dbUser) => {
          // Send user back to requester
          res.json(dbUser.getPublicUser())
        }).catch((giveScoreError) => {
          // Failed to give user new score
          logger.error(giveScoreError, {'context': 'giveScoreError'})
          res.error('Unexpected Error', 500)
        })
      }).catch((dbSaveError) => {
        logger.error(dbSaveError, {'context': 'dbSaveError'})
        res.error('Unexpected Error', 500)
      })
    } catch (locationError) {
      return res.error('Invalid Location Data')
    }
  } else {
    res.error('Not During Event Time')
  }
}

module.exports = handler
