const passport = require('passport')
const User = require('../../models/User')
const config = require('../../config')
const googleCertificates = require('./googleCertificates')
const JWT = require('passport-jwt')
const jwt = require('jsonwebtoken')
const debug = require('debug')('stuco:web:auth:passporthandler')

/**
  * @apiDefine AuthParam
  * @apiHeader {String} Authorization Prefixed Google JWT token
  * @apiHeaderExample {json} Authorization
  *   {
  *     "Authorization": "JWT WVYpCSuZiyx.yr4j1ZUScxn7JjOjenlaEDPJmuNvgooXpgZyN.8kDly6p5L23J"
  *   }
  * @apiError {String} AuthError User was unable to be authenticated
  * @apiErrorExample {String} Authentication Error
  *     HTTP/1.1 401 Unauthorized
  *     Unauthorized
*/

let loginHandler = (googleUser, resolve) => {
  debug('handle login for "%s"', googleUser.sub)
  User.findOne({
    uid: googleUser.sub
  }, (err, user) => {
    if (err) {
      return resolve(err, false)
    }
    if (user) {
      debug('user found')
      user.lastlogin = new Date()
      user.save().then((dbUser) => {
        return resolve(null, dbUser)
      }).catch((dbError) => {
        return resolve(dbError)
      })
    } else {
      debug('user not found creating user "%s"', googleUser.sub)
      User.createUser(googleUser).then((dbUser) => {
        debug('create user succeeded "%s"', googleUser.sub)
        return resolve(null, dbUser)
      }).catch((userCreationError) => {
        debug('create user failed "%s" %O', googleUser.sub, userCreationError.message)
        return resolve(userCreationError)
      })
    }
  })
}

let init = () => {
  debug('init')
  const ExtractJwt = JWT.ExtractJwt
  const jwtStategy = new JWT.Strategy({
    authScheme: 'Token',
    algorithms: ['RS256'],
    issuer: [
      'https://accounts.google.com', 'accounts.google.com'
    ],
    audience: config.google.oauth.clientId,
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeader(),
      ExtractJwt.fromBodyField('id_token'),
      ExtractJwt.fromUrlQueryParameter('id_token'),
      ExtractJwt.fromUrlQueryParameter('auth')
    ]),
    secretOrKey: (token, resolve) => {
      try {
        return resolve(null, googleCertificates.get(jwt.decode(token, {complete: true}).header.kid))
      } catch (e) {
        return resolve(e)
      }
    }
  }, loginHandler)
  debug('use passport strategy jwtStrategy')
  passport.use(jwtStategy)
}

module.exports = init
