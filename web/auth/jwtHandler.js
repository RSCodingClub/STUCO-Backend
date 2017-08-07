
const User = require('../../models/User')
const { get: getCerts } = require('./googleCertificates')

function getSecret (req, header, payload, done) {
  let secret = getCerts(header.kid)
  return done(null, secret)
}

function fromAuthHeader (request, prefix) {
  prefix = prefix || 'JWT '
  let header = request.headers.authorization
  if (header == null) return header
  if (header.indexOf(prefix) === 0) return header.substring(prefix.length)
}

function fromBodyField (request, field) {
  return request.body.field
}

function getToken (request) {
  let token = fromAuthHeader(request) ||
    fromAuthHeader(request, 'JWT ') ||
    fromAuthHeader(request, 'Bearer ') ||
    fromBodyField(request, 'id_token') ||
    request.query['id_token'] ||
    request.query.auth
  if (token == null) {
    throw new Error('Missing or Invalid Authentication Header')
  }
  return token
}

async function handleLogin (req, res, next) {
  let googleUser = req.user
  let dbUser = await User.findOne({uid: googleUser.sub})
  if (dbUser == null) {
    try {
      dbUser = await User.createUser(googleUser)
    } catch (createUserError) {
      return res.status(400).error(createUserError)
    }
  }
  req.user = dbUser
}

// async function deserialize (googleUser) {
//   let dbUser = await User.findOne({uid: googleUser.sub})
//   if (dbUser == null) {
//     return new Error('User Not Found')
//   }
//   return dbUser
// }

module.exports.handleLogin = (req, res, next) => { handleLogin(req, res, next).then(next).catch(next) }
// module.exports.deserialize = deserialize
module.exports.getSecret = getSecret
module.exports.getToken = getToken
