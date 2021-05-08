'use strict';

const server = require('../server.js');
const chai = require('chai');
const chaiHttp = require('chai-http');

// Assertion
chai.should();
chai.use(chaiHttp);

let auth_token;

describe('Test the authentication API`s endpoints', () => {

    describe('Test POST route /auth/register', () => {
        it('should create a new account', (done) =>{
            chai.request(server)
                .post('/auth/register')
                .send({
                    username: 'MochaTestUsername3',
                    emailAddress: 'MochaTestEmail3',
                    password: 'MochaTestPassword'
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message');
                done();
                });
        });
    });

    describe('Test POST route /auth/login', () => {
        it('should return a basic token', (done) =>{
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'MochaTestUsername3',
                    password: 'MochaTestPassword'
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('token');
                    auth_token = response.body.token;
                done();
                });
        });
    });

    describe('Test POST route /auth/auth_check', () => {
        it('should verify that the token exist successfully', (done) =>{
            chai.request(server)
                .post('/auth/auth_check')
                .send({
                    token: auth_token
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message');
                done();
                });
        });
    });

});