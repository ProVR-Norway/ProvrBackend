'use strict'

const server = require('../server.js')
const chai = require('chai')
const chaiHttp = require('chai-http')

// Assertion
chai.should()
chai.use(chaiHttp)

let auth_token
const username = 'MochaTestUsername' // Must be changed for each test. Will be resolved with delete user endpoint
const email = 'MochaTestEmail' // Must be changed for each test. Will be resolved with delete user endpoint
const password = 'MochaTestPassword'

describe('Test the authentication API`s endpoints', () => {
  describe('Test POST route /auth/register', () => {
    it('should create a new account', (done) => {
      chai
        .request(server)
        .post('/auth/register')
        .send({
          username: username,
          emailAddress: email,
          password: password
        })
        .end((err, response) => {
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
          done()
        })
    })
  })

  describe('Test POST route /auth/login', () => {
    it('should return a basic token', (done) => {
      chai
        .request(server)
        .post('/auth/login')
        .send({
          username: username,
          password: password
        })
        .end((err, response) => {
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('token')
          auth_token = response.body.token
          done()
        })
    })
  })

  describe('Test POST route /auth/auth_check', () => {
    it('should verify that the token exist successfully', (done) => {
      chai
        .request(server)
        .post('/auth/auth_check')
        .send({
          token: auth_token
        })
        .end((err, response) => {
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
          done()
        })
    })
  })

  /*
    describe('Test DELETE route /auth/{username}', () => {
        it('should delete a user', (done) =>{
            chai.request(server)
                .delete('/auth/' + encodeURI(username))
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    //response.body.should.have.property('message');
                done();
                });
        });
    });
    */
})
