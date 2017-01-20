
const permission = require('permission')

let handler = () => {}

let after = (req, res, next, authStatus) => {
  if (authStatus === permission.AUTHORIZED) {
    return next()
  } else if (authStatus === permission.NOT_AUTHORIZED) {
    // If user is authenticated and there is a target user send is self and continue
    /*
    Use the following code segment to ignore is self
    if (req.isSelf) {
      return res.error('Permission Requirements Not Met')
    }
    */
    if (req.user.uid === req.targetUser.uid) {
      req.isSelf = true
      return next()
    }
    return res.error('Permission Requirements Not Met')
  } else if (authStatus === permission.NOT_AUTHENTICATED) {
    return res.error('Missing or Invalid Authentication Header')
  } else {
    return res.error('authorizationError')
  }
}

module.exports = handler
module.exports.settings = {
  after
}
