const express = require('express')
const logger = require('winston')
const Github = require('github')
const Router = express.Router
const router = new Router()
const config = require('../../../../../config')
const Bugreport = require('../../../../../models/Bugreport')

const RateLimit = require('express-rate-limit')
const github = new Github({
  debug: false,
  protocol: 'https',
  host: 'api.github.com',
  pathPrefix: '',
  timeout: 5000,
  headers: {
    'user-agent': 'STUCO-Backend-Server'
  },
  followRedirects: false,
  includePreview: true
})

github.authenticate({type: 'token', token: config.github.access_token})

// NOTE: We may need to add permissions to only allow certain users to submit BugreportSchema
// NOTE: We also may want to add a quota for certain roles, (student is 5 reports per hour, tester is unlimmited, etc)
/**
  * @api {post} /api/v1/bugreport Submit a bug report
  * @apiVersion 1.0.0
  * @apiName Submit
  * @apiGroup Bugreport
  * @apiDescription Submit a bug report to bugreport database and github issues
  *
  * @apiUse AuthParam
  *
  * @apiParam {String="crash","ui","login","event","other"} bugtype The type or category of bug
  * @apiParam {String{1..512}} summary Title for the bug occuring
  * @apiParam {String{16..4096}} description Description of the bug
  * @apiParam {String} [syslogs] System logs at the time of the bug
  * @apiParam {String} [applogs] Application logs associated with the bug
  *
  * @apiSuccess {String} submitter User ID of the submitter
  * @apiSuccess {Boolean} closed Whether or not the issue has been handled
  * @apiSuccess {String} summary Submitted title of the bugreport
  * @apiSuccess {String} description Submitted description of the bugreport
  * @apiSuccess {String} bugtype Submitted type of the bugreport
*/
router.post('/', (req, res) => {
  if (req.body.bugtype == null || req.body.summary == null || req.body.summary.trim() === '' || req.body.description == null || req.body.description === '') {
    return res.status(400).error('Body Parameters Not Met')
  } else {
    // NOTE: We may possibly want to store reports locally as well as setup a webhook to update them from github as they are closed, edited, or labeled
    new Bugreport({
      submitter: req.user.uid,
      bugtype: req.body.bugtype,
      summary: req.body.summary,
      description: req.body.description,
      syslogs: req.body.syslogs,
      applogs: req.body.applogs
    }).save().then((dbBug) => {
      // TODO: Do checking for duplicate bugs then create issue
      github.issues.create({
        owner: 'RSCodingClub',
        repo: 'STUCO-Backend',
        title: dbBug.summary,
        body: dbBug.description.toString().trim(),
        labels: ['bug', dbBug.bugtype]
      }).then((issue) => {
        logger.info('Created Github bug report.')
        return res.json(dbBug.pretty())
      }).catch((githubError) => {
        logger.error(githubError, {context: 'githubError'})
        return res.status(500).error()
      })
    }).catch((dbError) => {
      logger.error(dbError, {context: 'dbError'})
      return res.status(500).error()
    })
  }
})

router.use(new RateLimit({
  message: 'Too many bug reports submitted too fast.  Wait a few minutes before trying again.',
  headers: true,
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 25,
  delayAfter: 1,
  delayMs: (15 * 60 * 1000) / (25 - 1) // Delay requests as to never reach the max
}))

module.exports = router
