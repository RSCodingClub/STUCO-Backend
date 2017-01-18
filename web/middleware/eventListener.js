'use strict'

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

let init = () => {
  debug('init')
  return new Promise((resolve, reject) => {
    auth().then((authClient) => {
      channelId = uuid.v4()
      watchEvents({
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
      }).then((response) => {
        // NOTE: We originally got events at this point but, watching events will trigger a request in which we request events anyways
        // Renew watch 10 seconds before TTL expires
        setTimeout(init, (ttl - 10) * 1000)
        return resolve(response)
      }).catch((watchEventsError) => {
        return reject(watchEventsError)
      })
    }).catch((authorizationError) => {
      return reject(authorizationError)
    })
  })
}

let handler = (req, res) => {
  return new Promise((resolve, reject) => {
    auth().then((authClient) => {
      getEvents({calendarId: config.google.calendarId, auth: authClient, key: config.google.apiKey, syncToken: lastSyncToken, timeZone: 'UTC'}).then((events) => {
        // NOTE: Possibly stupid code, potentially revise
        processEvents(events).then((events) => {
          return resolve(events)
        }).catch((processEventsError) => {
          return reject(processEventsError)
        })
      }).catch((getEventsError) => {
        return reject(getEventsError)
      })
    }).catch((authorizationError) => {})
  }).then((events) => {
    res.status(200).send('Successfully Retrieved Google Events')
  }).catch((eventListenerError) => {
    debug('error handling event update', eventListenerError)
    res.status(500).error('Error Retrieving Google Events', 500)
  })
}

let auth = () => {
  // TODO: Move or find an alternative to using private json files to authenticate
  let authClient = new google.auth.JWT(config.google.serviceAccount.clientEmail, '../private/GoogleTest-b468be9d42ba.json', config.google.serviceAccount.clientKey, ['https://www.googleapis.com/auth/calendar'], config.google.serviceAccount.clientEmail)
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

let watchEvents = (options) => {
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

let processEvents = (events) => {
  debug('process ' + events.length + ' events')
  events.filter((evnt) => {
    return evnt.status === 'cancelled' && evnt.location != null
  })
  return new Promise((resolve, reject) => {
    Promise.all(events.filter((evnt) => {
      return evnt.status !== 'cancelled' && evnt.location != null
    }).map(Evnt.addEvent)).then((responses) => {
      logger.info('Calendar updated, ' + (responses.length || 0) + ' events changed.')
      return resolve(responses)
    }).catch((dbError) => {
      logger.error('Database error saving events.')
      return reject(dbError)
    })
  })
}

process.on('exit', () => {
  debug('revoking webhook on channel ' + channelId)
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
module.exports.init = init
