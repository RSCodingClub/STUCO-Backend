'use strict'

const logger = require('winston')
// const Evnt = require('../../../../../models/Event')
const config = require('../../../../../config')

// Checkin Handler
// async function handlerNew (req, res) {
//   if (req.targetEvent.userAttending(req.user)) {
//     return res.status(400).error('Already Checked In')
//   }
//   if (!(new Date(req.targetEvent.start).getTime() < Date.now() && new Date(req.targetEvent.end).getTime() > Date.now())) {
//     return res.status(500).error('Not During Event Time')
//   }
//
//   try {
//     if (req.targetEvent.location.distanceTo(req.location) > config.location.maxAccuracy) {
//       return res.status(400).error('Not At Event Location')
//     }
//   } catch (locationError) {
//     return res.status(400).error('Invalid Location Data')
//   }
//   // Add user to attendees
//   req.targetEvent.attendees.push(req.user)
//   // Save event with new attendee
//   try {
//     let dbEvent = await req.targetEvent.save()
//     // TODO: Give badge based on category to user
//     // Give score to user
//     try {
//       let dbUser = await req.user.giveScore({
//         value: dbEvent.reward,
//         type: 'event',
//         eid: dbEvent.eid
//       }).save()
//       return res.json(dbUser.getPublicUser())
//     } catch (dbSaveError) {
//       // Failed to give user new score
//       logger.error(dbSaveError, {'context': 'dbError'})
//       return res.status(500).error()
//     }
//   } catch (dbSaveError) {
//     logger.error(dbSaveError, {'context': 'dbError'})
//     return res.status(500).error()
//   }
// }
/**
  * @api {post} /api/event/v1/:eventid/checkin Check into an event
  * @apiVersion 1.0.0
  * @apiName EventCheckin
  * @apiGroup Event
  * @apiDescription Check the authenticated user into and event
  *
  * @apiUse AuthParam
  *
  * @apiParam (Location) {Number} latitude User's latitude
  * @apiParam (Location) {Number} longitude User's longitude
  * @apiParam (Location) {Number} [accuracy=50] User's location service accuracy
  *
  * @apiUse publicUser
  *
  * @apiError (Event Time 400) NotDuringEventTime {object} When a user attempts to checkin outside of an events time
  * @apiErrorExample {json} Error-Response:
  *     HTTP/1.1 400
  *     {
  *       "error": "Not During Event Time",
  *       "errorid": 10
  *     }
*/
function handler (req, res) {
  if (!(new Date(req.targetEvent.start).getTime() < Date.now() && new Date(req.targetEvent.end).getTime() > Date.now())) {
    return res.error('Not During Event Time')
  }
  if (req.targetEvent.userAttending(req.user)) {
    return res.error('Already Checked In', 400)
  }
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
}

module.exports = handler
