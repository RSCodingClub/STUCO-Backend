
const permission = require('permission')

let handler = () => {}
/**
  * @apiDefine student student
  * Student role with few admin features
*/
/**
  * @apiDefine tester tester
  * Application tester role with features needed for testing
*/
/**
  * @apiDefine teacher teacher
  * Teacher role for micromanaging the public side of the application
*/
/**
  * @apiDefine stuco stuco
  * Student council role allowing managing for maintaining the public side of the application
*/
/**
  * @apiDefine developer developer
  * Developer role with features any feature needed to modify or continue progress on the public or private application
*/
/**
  * @apiDefine admin admin
  * Admin role with any permissions required for running the application
*/
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
