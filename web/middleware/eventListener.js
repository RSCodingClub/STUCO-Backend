'use strict'

const path = require('path')
const uuid = require('uuid')
const logger = require('winston')
const google = require('googleapis')
const debug = require('debug')('stuco:web:middleware:eventlistener')
const config = require('../../config')
const Evnt = require('../../models/Event')

const calendar = google.calendar('v3')

let channelId
let ttl = config.isDevelopment ? 600 : 7200 // 2 hours for production, shorter times for development
let lastSyncToken

async function initialize () {
  try {
    let authClient = await auth()
    channelId = uuid.v4()
    try {
      let response = await watchEvents({
        calendarId: config.google.calendarId,
        auth: authClient,
        key: config.google.apiKey,
        timeZone: 'UTC',
        resource: {
          id: channelId,
          token: 'email=' + config.google.serviceAccount.clientEmail,
          address: config.server.endpoint + '/eventlistener',
          type: 'web_hook',
          params: {
            ttl: ttl
          }
        }
      })
      setTimeout(initialize, (ttl - 10) * 1000)
      return response
    } catch (watchEventsError) {
      debug('watch events error')
      throw watchEventsError
    }
  } catch (authorizationError) {
    debug('authorization error with google calendar')
    throw authorizationError
  }
}

async function handler (request, response) {
  let authClient = await auth()
  let events = await getEvents({calendarId: config.google.calendarId, auth: authClient, key: config.google.apiKey, syncToken: lastSyncToken, timeZone: 'UTC'})
  try {
    await processEvents(events)
    return response.status(200).send('Successfully Retrieved Google Events')
  } catch (eventListenerError) {
    debug('error handling event update', eventListenerError)
    return response.status(500).error('Error Retrieving Google Events', 500)
  }
}

async function auth () {
  // TODO: Figure out how to avoid using a file at all
  let authClient = new google.auth.JWT(config.google.serviceAccount.clientEmail, path.join('../../', config.google.serviceAccount.clientFile), config.google.serviceAccount.clientKey, ['https://www.googleapis.com/auth/calendar'], config.google.serviceAccount.clientEmail)
  return new Promise((resolve, reject) => {
    authClient.authorize((authorizationError, tokens) => {
      if (authorizationError) {
        debug('failed to authorize')
        return reject(authorizationError)
      }
      debug('successfully authorized')
      return resolve(authClient)
    })
  })
}

async function watchEvents (options) {
  return new Promise((resolve, reject) => {
    calendar.events.watch(options, (initializeWatchError, response) => {
      if (initializeWatchError) {
        debug('failed to create listener')
        return reject(initializeWatchError)
      }
      if (response.kind !== 'api#channel') {
        debug('failed created listener kind mismatch')
        return reject(new Error('Non-Matching Response Kind'))
      }
      if (response.id !== channelId) {
        // NOTE: Potentially bug prone, possibly won't want to reject
        debug('failed created listener channeldid mismatch')
        return reject(new Error('Non-Matching Channel IDs'))
      }
      debug('successfully created listener')
      return resolve(response)
    })
  })
}

let stopWatching = (options) => {
  return new Promise((resolve, reject) => {
    calendar.channels.stop(options, (stopWatchingError, response) => {
      // NOTE: Logging here will most likely not run if the application is exiting
      if (stopWatchingError) {
        debug('failed to revoke webhook on channel ' + channelId)
        return reject(stopWatchingError)
      }
      debug('revoked webhook on channel ' + channelId)
    })
  })
}

let getEvents = (options) => {
  return new Promise((resolve, reject) => {
    calendar.events.list(options, (getEventsError, response) => {
      if (getEventsError) {
        debug('failed to retrieve events')
        logger.error(getEventsError)
        return reject(getEventsError)
      }
      lastSyncToken = response.nextSyncToken
      debug('retrieved ' + response.items.length + ' events')
      return resolve(response.items)
    })
  })
}

async function processEvents (events) {
  debug('process ' + events.length + ' events')
  try {
    let responses = await Promise.all(events.filter((evnt) => {
      return evnt.status !== 'cancelled' && evnt.location != null
    }).map(Evnt.addEvent))
    logger.info('Calendar updated, ' + (responses.length || 0) + ' events changed.')
    return responses
  } catch (dbError) {
    logger.error('Database error saving events.')
    throw dbError
  }
}

process.on('exit', () => {
  debug('revoking webhook on channel ' + channelId)
  // NOTE: Comments below remove code that is unnecessary and may cause errors if they are undefined or empty
  stopWatching({
    // auth: authClient,
    key: config.google.apiKey,
    resource: {
      id: channelId
      // resourceId: response.resourceId,
      // token: response.token
    }
  })
})

module.exports.handler = handler
module.exports.init = initialize
