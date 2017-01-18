const passport = require('passport')
const User = require('../../models/User')

let init = () => {
  passport.serializeUser((user, done) => {
    return done(null, user.uid)
  })
  passport.deserializeUser((userId, done) => {
    User.findOne({uid: userId}).then((dbUser) => {
      if (dbUser == null) {
        return done(new Error('User Not Found'))
      }
      return done(null, dbUser)
    }).catch(done)
  })
}

module.exports = init
