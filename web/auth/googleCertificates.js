'use strict'

const debug = require('debug')('stuco:web:auth:googlecerts')
const request = require('request-promise-native')
const Cache = require('node-cache')
// Standard Google response TTL
const googleCertificates = new Cache({checkperiod: 600, stdTTL: 22285})

let init = () => {
  return new Promise((resolve, reject) => {
    request({method: 'GET', uri: 'https://www.googleapis.com/oauth2/v1/certs', resolveWithFullResponse: true, json: true}).then((response) => {
      debug('cache size is now %d', googleCertificates.getStats().keys)
      debug('retrived %d certificates', Object.keys(response.body).length)
      // TTL is 600 seconds shorter than original so that it will be checked before expiring (31 days max 1 second min)
      let ttl = Math.max(Math.min(Math.round((new Date(response.headers.expires).getTime() - Date.now()) / 1000) - 600, 60 * 60 * 24 * 31), 1)
      debug('certificates have %d seconds until they expire', ttl)
      googleCertificates.flushAll()
      for (let kid in response.body) {
        if (response.body.hasOwnProperty(kid)) {
          googleCertificates.del(kid)
          // Vary TTL by a little so they don't all simultaniously expire
          googleCertificates.set(kid, response.body[kid], ttl + Math.round(Math.random() * 10))
        }
      }
      debug('cache size is now %d', googleCertificates.getStats().keys)
      return resolve()
    }).catch(getGoogleCertsError => {
      debug('failed to retrieve google certificates', getGoogleCertsError)
      return reject(getGoogleCertsError)
    })
  })
}

let update = () => {
  init().catch((getGoogleCertsError) => {
    throw getGoogleCertsError
  })
}

googleCertificates.on('expired', (keyId, value) => {
  // Keep value stored in cache for 30 seconds or until replaced
  googleCertificates.set(keyId, value, 30)
  debug('keyid "%s" has expired', keyId)
  update()
})

module.exports = init
module.exports.get = googleCertificates.get
