
const express = require('express')
const router = express.Router({
  mergeParams: true
})
const github = new (require('github'))({
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
github.authenticate({
  type: 'basic',
  username: 'rscodingbot',
  password: 'codingclub1'
})
const Bugreport = require('../../../../../models/Bugreport')

router.post(['/submitbug', '/createbugreport', '/submitreport', '/bugreport', '/bug'], function (req, res) {
    // {bugtype, summary, description, syslogs, applogs}
  if (req.authenticated) {
    if (req.user.hasPermission('bugreports.create')) {
      if (req.body.bugtype === undefined || req.body.summary === undefined || req.body.summary.trim() === '' || req.body.description === undefined || req.body.description === '') {
        res.statusCode = 400
        return res.json(Utils.getErrorObject(new Error('Invalid Request Parameters')))
      } else {
        var bug = new Bugreport({
          submitter: req.user.subid,
          bugtype: req.body.bugtype,
          summary: req.body.summary,
          description: req.body.description,
          syslogs: req.body.syslogs,
          applogs: req.body.applogs
        })
        bug.save(function (err, dbBug) {
          if (err) {
            console.error(err, err.stack)
            res.statusCode = 500
            return res.json(Utils.getErrorObject(err))
          } else {
            github.issues.create({
              user: 'RSCodingClub',
              repo: 'STUCO-Backend',
              title: req.body.summary,
              body: req.body.description,
              labels: [req.body.bugtype]
            }, function (err) {
              if (err) {
                return res.json(Utils.getErrorObject(err))
              } else {
                return res.json(dbBug.pretty())
              }
            })
          }
        })
      }
    } else {
      res.statusCode = 400
      return res.json(Utils.getErrorObject(new Error('Permission Requirements Not Met')))
    }
  } else {
    res.statusCode = 400
    return res.json(Utils.getErrorObject(new Error('Missing or Invalid Authorization Header')))
  }
})
