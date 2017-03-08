'use strict'

const debug = require('debug')('stuco:web:auth:googlecerts')
const request = require('request-promise-native')
const jwkToPem = require('jwk-to-pem')
const Cache = require('node-cache')
// Standard Google response TTL
const googleCertificates = new Cache({checkperiod: 600, stdTTL: 22285})

async function initialize () {
  try {
    let response = await request({method: 'GET', uri: 'https://www.googleapis.com/oauth2/v3/certs', resolveWithFullResponse: true, json: true})

    debug('cache size is now %d', googleCertificates.getStats().keys)
    debug('retrived %d certificates', Object.keys(response.body).length)
    // TTL is 600 seconds shorter than original so that it will be checked before expiring (31 days max 1 second min)
    let ttl = Math.max(Math.min(Math.round((new Date(response.headers.expires).getTime() - Date.now()) / 1000) - 600, 60 * 60 * 24 * 31), 1)
    debug('certificates have %d seconds until they expire', ttl)
    googleCertificates.flushAll()
    for (let jwk of response.body.keys) {
      googleCertificates.del(jwk.kid)
      // Vary TTL by a little so they don't all simultaniously expire
      let pem = jwkToPem(jwk)
      googleCertificates.set(jwk.kid, pem, ttl + Math.round(Math.random() * 10))
    }
    debug('cache size is now %d', googleCertificates.getStats().keys)
    return
  } catch (getGoogleCertsError) {
    debug('failed to retrieve google certificates', getGoogleCertsError)
    throw getGoogleCertsError
  }
}

async function update () {
  await initialize()
}

googleCertificates.on('expired', (keyId, value) => {
  // Keep value stored in cache for 30 seconds or until replaced
  googleCertificates.set(keyId, value, 30)
  debug('keyid "%s" has expired', keyId)
  update()
})

module.exports = initialize
module.exports.get = googleCertificates.get
