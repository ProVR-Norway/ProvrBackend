'use strict'

const server = require('../server.js')
const chai = require('chai')
const chaiHttp = require('chai-http')

// Assertion
chai.should()
chai.use(chaiHttp)

describe('Test the cadmodel API`s endpoints', () => {
  describe('Test GET route /cadmodels', () => {
    it('should list all models of a user', (done) => {
      const username = 'admin123'
      chai
        .request(server)
        .get('/cadmodels' + '?username=' + username)
        .end((err, response) => {
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('models').that.have.length(11)
          done()
        })
    })
  })
})
