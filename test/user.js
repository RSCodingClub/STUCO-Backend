
const chai = require('chai')
const chaiHttp = require('chai-http')
const config = require('../config')
const server = require('../web')
const expect = chai.expect

chai.should()
chai.use(chaiHttp)

describe('User API', function () {
  let app
  before(function (done) {
    server.then((readyApp) => {
      app = readyApp
      return done()
    }).catch(done)
  })

  describe('Unauthenticated', function () {
    describe('Get Leaderboard', function () {
      it('should be error', function (done) {
        chai.request(app)
          .get('/api/user/v1/leaderboard')
          .send()
          .then((response) => {
            done(new Error('Response was supposed to error'))
          }).catch((err) => {
            err.response.should.have.status(401)
            err.response.text.should.be.a('string')
            err.response.text.should.equal('Unauthorized')
            done()
          })
      })
    })
  })

  describe('Authenticated', function () {
    let apiKey
    before(function (done) {
      if (config.test.apiKey == null) {
        throw new Error('TEST_API_KEY is a required variable when testing.')
      }
      apiKey = config.test.apiKey
      done()
    })
    describe('Get Leaderboard', function () {
      it('should be json', function (done) {
        chai.request(app)
          .get('/api/user/v1/leaderboard')
          .set('Authorization', 'KEY ' + apiKey)
          .send()
          .then((response) => {
            expect(response).to.have.status(200)
            expect(response).to.be.json
            done()
          }).catch((err) => {
            done(err)
          })
      })
    })
  })
})
