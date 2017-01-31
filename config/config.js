'use strict'
const debug = require('debug')('stuco:config')

const common = require('./components/common')
const logger = require('./components/logger')
const location = require('./components/location')
const server = require('./components/server')
const google = require('./components/google')
const test = require('./components/test')
const github = require('./components/github')
const mongodb = require('./components/mongodb')

const config = Object.assign({}, common, logger, location, server, google, test, github, mongodb)
debug('exporting', 'config') // Possibly print config object (However it contains credentials and should be avoided being printed)
module.exports = config
