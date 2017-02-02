
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

  describe('Get Leaderboard', function () {
    let response
    describe('Authenticated', function () {
      before(function (done) {
        chai.request(app)
          .get('/api/user/v1/leaderboard')
          .query({key: config.test.apiKey})
          .send()
          .then((resp) => {
            response = resp
            done()
          }).catch((err) => {
            done(err)
          })
      })
      it('Should return 200', () => {
        expect(response).to.have.status(200)
      })
      it('Should be return an array', () => {
        expect(response).to.be.json
        expect(response.body).to.be.an('array')
      })
      it('Should be have at least one user', () => {
        expect(response.body).to.have.length.of.at.least(1)
      })
    })

    describe('Unauthenticated', function () {
      before(function (done) {
        chai.request(app)
          .get('/api/user/v1/leaderboard')
          .send()
          .then((resp) => {
            done(new Error('Response was supposed to error'))
          }).catch((err) => {
            response = err.response
            done()
          })
      })
      it('Should return 401', () => {
        expect(response).to.have.status(401)
      })
      it('Should be return Unauthorized', () => {
        expect(response.text).to.be.a('string')
        expect(response.text).to.equal('Unauthorized')
      })
    })
  })

  describe('Get Authenticated User', function () {
    let response
    describe('Authenticated', function () {
      before(function (done) {
        chai.request(app)
          .get('/api/user/v1/')
          .query({key: config.test.apiKey})
          .send()
          .then((resp) => {
            response = resp
            done()
          }).catch((err) => {
            done(err)
          })
      })
      it('Should return 200', () => {
        expect(response).to.have.status(200)
      })
      it('Should be return an object', () => {
        expect(response).to.be.json
        expect(response.body).to.be.an('object')
      })
      it('Should contain userid and name', () => {
        expect(response.body.uid).to.not.be.null
        expect(response.body.name).to.not.be.null
      })
    })

    describe('Unauthenticated', function () {
      before(function (done) {
        chai.request(app)
          .get('/api/user/v1/leaderboard')
          .send()
          .then((resp) => {
            done(new Error('Response was supposed to error'))
          }).catch((err) => {
            response = err.response
            done()
          })
      })
      it('Should return 401', () => {
        expect(response).to.have.status(401)
      })
      it('Should be return Unauthorized', () => {
        expect(response.text).to.be.a('string')
        expect(response.text).to.equal('Unauthorized')
      })
    })
  })

  describe('Get Another User', function () {
    let response
    describe('Authenticated', function () {
      before(function (done) {
        chai.request(app)
          .get('/api/user/v1/' + config.test.userid)
          .query({key: config.test.apiKey})
          .send()
          .then((resp) => {
            response = resp
            done()
          }).catch((err) => {
            done(err)
          })
      })
      it('Should return 200', () => {
        expect(response).to.have.status(200)
      })
      it('Should be return an object', () => {
        expect(response).to.be.json
        expect(response.body).to.be.an('object')
      })
      it('Should contain userid and name', () => {
        expect(response.body.uid).to.not.be.null
        expect(response.body.name).to.not.be.null
      })
    })

    describe('Unauthenticated', function () {
      before(function (done) {
        chai.request(app)
          .get('/api/user/v1/leaderboard')
          .send()
          .then((resp) => {
            done(new Error('Response was supposed to error'))
          }).catch((err) => {
            response = err.response
            done()
          })
      })
      it('Should return 401', () => {
        expect(response).to.have.status(401)
      })
      it('Should be return Unauthorized', () => {
        expect(response.text).to.be.a('string')
        expect(response.text).to.equal('Unauthorized')
      })
    })
  })
})
