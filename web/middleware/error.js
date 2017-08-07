
const debug = require('debug')('stuco:web:middleware:error')
let errorCodes = {
  'User Not Found': 0,
  'Requesting User Not Found': 1,
  'Event Not Found': 2,
  'Invalid Location Data': 3,
  'Google Token Validation Failed': 4,
  'TokenIssuer is Invalid': 5,
  'Invalid Token Certificate': 6,
  'UserToken Has Expired': 7,
  'Not At Event Location': 8,
  'Already Checked Into Event': 9,
  'Not During Event Time': 10,
  'User File Empty': 11,
  'Failed to Create User': 12,
  'Invalid UserToken': 13,
  'Permission Requirements Not Met': 14,
  'Invalid Permission Type': 15,
  'Badge Not Found': 16,
  'DeprecationWarning': 17,
  'Invalid Request Parameters': 18,
  'Missing or Invalid Authentication Header': 19,
  'Failed to Edit User': 20,
  'Google Certificates Retrieval Error': 21,
  'Certificate Parsing Error': 22,
  'Invalid Email Domain': 23,
  'Malformed UserToken': 24,
  'Invalid API Key': 25,
  'Unexpected Error': 26
}

let error = (req, res, next) => {
  debug('initializing response error method')
  res.error = (error) => {
    debug('response error method called')
    if (error == null) {
      debug('assuming unxpected since error was null')
      error = 'Unexpected Error'
    }
    if (!(error instanceof Error)) {
      error = new Error(error.toString().replace(/(?:\r\n|\r|\n)/g, '').trim())
    }
    return res.json({
      error: error.message,
      errorid: errorCodes[error.message] == null
        ? -1
        : errorCodes[error.message]
    })
  }
  debug('initialized response error method')
  return next()
}

module.exports.inject = error
module.exports.errorCodes = errorCodes
