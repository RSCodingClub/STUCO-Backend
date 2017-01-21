var mongoose = require('mongoose')
var Schema = mongoose.Schema

var BugreportSchema = new Schema({
  submitter: {
    type: String,
    required: true,
    unique: false
  },
  closed: {
    type: Boolean,
    default: false
  },
  bugtype: {
    type: String,
    enum: {
      values: ['crash', 'ui', 'login', 'event', 'other'],
      message: 'Invalid Bug Type'
    },
    default: 'other'
  },
  summary: {
    type: String,
    maxlength: [512, 'Summary is too long'],
    required: true
  },
  description: {
    type: String,
    minlength: [16, 'Description is too short'],
    maxlength: [4096, 'Description is too long'],
    required: true
  },
  syslogs: {
    type: String
  },
  applogs: {
    type: String
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  updated_at: {
    type: Date
  }
})

BugreportSchema.pre('save', function (next) {
  this.updated_at = new Date()
  if (!this.created_at) {
    this.created_at = new Date()
  }
  next()
})

// Formatting
BugreportSchema.methods.toString = function () {
  return this.summary.toString().trim()
}

BugreportSchema.methods.pretty = function () {
  return {
    submitter: this.submitter,
    closed: this.closed,
    bugtype: this.bugtype,
    description: this.description
  }
}

let Bugreport = mongoose.model('Bugreport', BugreportSchema)
module.exports = Bugreport

module.exports.getBugreportsByUser = function (uid, callback) {
  Bugreport.find({}).where('submitter.uid').equals(uid).execute(callback)
}

module.exports.getBugreports = function (callback) {
  Bugreport.find({}, callback)
}
