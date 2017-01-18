'use strict'

const request = require('supertest')
const sinon = require('sinon')
const server = require('../../../../server')

const url = '/api/user/v1/' + process.env.TEST_USER_ID

describe(`GET ${url}`, () => {
  describe(`GET ${url}/all`, () => {
    beforeEach(function () {
      console.log('beforeEach')
      this.sandbox = sinon.sandbox.create()
      // this.sandbox.stub()
    })
    before(function (done) {
      server.then((app) => {
        this.app = app
        done()
      }).catch((serverError) => {
        done(serverError)
        throw serverError
      })
    })
    it('should return a JSON object', (done) => {
      // Error or not it will always be JSON
      request(this.app)
        .get(url)
        .set('Accept', 'application/json', done)
        .expect((res) => {
          console.log('RESPONSE', res)
        })
    })
    it('should return an error without auth', (done) => {
      server.then((server) => {
        request(server)
          .get(url)
          .set('Accept', 'application/json')
          .expect(400)
          .expect((res) => {
            console.log('RESPONSE', res)
          })
      })
    })
  })
})
