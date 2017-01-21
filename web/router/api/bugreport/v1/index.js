const express = require('express')
const logger = require('winston')
const Github = require('github')
const Router = express.Router
const router = new Router()
const config = require('../../../../../config')
const Bugreport = require('../../../../../models/Bugreport')

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

// Works github.authenticate({type: 'basic', username: config.github.username, password: config.github.access_token})
github.authenticate({type: 'token', token: config.github.access_token})

// NOTE: We may need to add permissions to only allow certain users to submit BugreportSchema
// NOTE: We also may want to add a quota for certain roles, (student is 5 reports per hour, tester is unlimmited, etc)
router.post('/', (req, res) => {
  // {bugtype, summary, description, syslogs, applogs}
  if (req.body.bugtype == null || req.body.summary == null || req.body.summary.trim() === '' || req.body.description == null || req.body.description === '') {
    return res.error('Body Parameters Not Met')
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
      // return res.json(dbBug.pretty())
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
        return res.error()
      })
    }).catch((dbError) => {
      logger.error(dbError, {context: 'dbError'})
      return res.error()
    })
  }
})

module.exports = router
