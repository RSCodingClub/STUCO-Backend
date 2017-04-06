'use strict'
const mongoose = require('mongoose')
const moment = require('moment-timezone')
const Loc = require('./Location')
const config = require('../config')

let EventSchema = new mongoose.Schema({
  // Unique identifier for the event
  eid: {
    type: String,
    required: true,
    unique: true
  },
  // Status of the event
  status: {
    type: String,
    default: 'confirmed',
    enum: ['confirmed', 'tentative', 'cancelled']
  },
  // Event Title
  summary: {
    type: String,
    required: true,
    trim: true
  },
  // Short description of the event
  description: {
    type: String,
    default: ''
  },
  reward: {
    type: Number,
    default: 5,
    required: true
  },
  // All times should be stored as UTC
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date
  },
  location: {
    type: Loc.schema,
    required: true
  },
  // Array of users attending
  attendees: {
    type: Array,
    default: [],
    required: false
  },
  // Custom event type parameter (Either stored in description or crawled through the title)
  category: {
    type: String
    // enum: ['football', 'homecominggame', 'homecomingdance', 'baseball', 'basketball', 'softball', 'tennis', 'lacrosse', 'artshow', 'theater', 'choir', 'band', 'orchestra', 'fieldhokey', 'hockey', 'waterpolo', 'swimming', 'club', 'peprally', 'dollardance', 'winterdance', 'orientation', 'icecreamsocial', 'trunkortreat', 'cocoandcramming', 'other']
  }
}, {
  collection: 'events-' + config.google.calendarId.split('@')[0]
})

EventSchema.pre('validate', function (next) {
  const debug = require('debug')('stuco:model:event:pre:validate')
  debug('parse event category from title and description')
  // Mode method credit to Anjuna5 on stack exchange
  function mode (arr) {
    debug('mode of array calculator')
    return [...new Set(arr)]
      .map((value) => [value, arr.filter((v) => v === value).length])
      .sort((a, b) => a[1] - b[1])
      .reverse()
      .filter((value, i, a) => a.indexOf(value) === i)
      .filter((v, i, a) => v[1] === a[0][1])
      .map((v) => v[0])
  }
  let categories = (/(football|dance|volleyball|baseball|basketball|softball|tennis|lacrosse|art\w*|theater|choir|band|orchestra|field(-| )?hockey|hockey|waterpolo|swimming|club|pep\w*|other)/gi).exec(this.summary + ' ' + this.description)
  if (categories.length === 0) categories = ['other']
  this.category = mode(categories)[0].toLowerCase()
  return next()
})

// Formatting
EventSchema.methods.toString = function () {
  const debug = require('debug')('stuco:model:event:tostring')
  debug('send summary as string')
  return this.summary
}
EventSchema.methods.exportEvent = function () {
  const debug = require('debug')('stuco:model:event:exportevent')
  debug('exporting')
  return {
    eid: this.eid,
    status: this.status,
    category: this.category,
    summary: this.summary,
    description: this.description,
    reward: this.reward,
    start: this.start,
    end: this.end,
    location: this.location,
    attendees: this.attendees
  }
}

EventSchema.methods.getPublicEvent = function () {
  const debug = require('debug')('stuco:model:event:getpublicevent')
  debug('exporting')
  return {
    eid: this.eid,
    category: this.category,
    summary: this.summary,
    description: this.description,
    reward: this.reward,
    start: this.start,
    end: this.end,
    location: this.location.address,
    attendees: this.attendees.length
  }
}

EventSchema.methods.userAttending = function (user) {
  const debug = require('debug')('stuco:model:event:userattending')
  debug('find user ' + user + ' in ' + this.eid)
  return Boolean(this.attendees.filter((attendee) => {
    return attendee.uid === user.uid
  }).length)
}

let Evnt = module.exports = mongoose.model('Event', EventSchema)
module.exports.schema = EventSchema

module.exports.addEvent = (googleEvent) => {
  const debug = require('debug')('stuco:model:event:addEvent')
  debug('add event', googleEvent.id)
  // Don't store cancelled events
  // BUG: If event is cancelled delete it from the database, also potentially go through its attendees first and remove score with matching eid
  if (googleEvent.status === 'cancelled') return Promise.reject('Event is cancelled.')
  // Steps
  // Convert all non schema variables to schema variables (address to lat lon, dates to datetime)
  // Search for event category
  // Compile new object
  let start = moment(googleEvent.start.dateTime || googleEvent.start.date)
  let end = moment(googleEvent.end.dateTime || googleEvent.end.date)
  debug('creating event with times ' + googleEvent.summary + ': ' + start.format('dddd, MMMM Do YYYY, h:mm:ss a') + ' - ' + end.format('dddd, MMMM Do YYYY, h:mm:ss a'))
  let loc = new Loc({
    address: googleEvent.location
  })
  // If the event is continuous set it to end 24 hours after the start
  if (googleEvent.endTimeUnspecified) {
    debug('end time is unspecified defaulting to 24 hours')
    end = start.add(1, 'days')
  }
  return loc.validate().then(() => {
    debug('validated location successfully')
    return Evnt.update({
      eid: googleEvent.id
    }, {
      eid: googleEvent.id,
      status: googleEvent.status,
      summary: googleEvent.summary,
      description: googleEvent.description,
      location: loc,
      start: start.toDate(),
      end: end.toDate()
    }, {
      upsert: true,
      multi: true,
      runValidators: true
    })
  }).catch((validationError) => {
    debug('location validation error')
    return Promise.reject(validationError)
  })
}

module.exports.eventExists = (eid) => {
  const debug = require('debug')('stuco:model:event:eventexists')
  debug('checking if event "' + eid + '" exists')
  return new Promise((resolve) => {
    Evnt.getEvent(eid).then((evnt) => {
      resolve(evnt !== undefined)
    }).catch((dbError) => {
      resolve(false)
    })
  })
}

module.exports.getEvent = (eid) => {
  const debug = require('debug')('stuco:model:event:getevent')
  debug('getting event ' + eid)
  return Evnt.findOne({
    eid: eid
  })
}

module.exports.getEvents = (limit, index) => {
  const debug = require('debug')('stuco:model:event:getevents')
  debug('getting events')
  return Evnt.find({}).sort({end: 1}).skip(index || 0).limit(limit || Number.MAX_SAFE_INTEGER)
}

module.exports.getActiveEvents = (limit, index) => {
  const debug = require('debug')('stuco:model:event:getactiveevents')
  debug('getting active events')
  return Evnt.find({}).where('end').gt(new Date()).sort('+start').skip(index || 0).limit(limit || Number.MAX_SAFE_INTEGER)
}
