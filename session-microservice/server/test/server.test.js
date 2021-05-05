'use strict';

const server = require('../server.js');
const chai = require('chai');
const chaiHttp = require('chai-http');

// Assertion
chai.should();
chai.use(chaiHttp);

describe('Test the session API`s endpoints', () => {

    describe('Test POST route /sessions', () => {
        it('should create a new session', (done) =>{
            const username = 'admin123';
            chai.request(server)
                .post('/sessions')
                .send({
                    sessionName: 'TestSessionName',
                    mapName: 'TestMapName',
                    maxParticipants: 8,
                    hostUsername: username
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('sessionId');
                done();
                });
        });
    });

    describe('Test GET route /sessions?username=admin123', () => {
        it('should return all sessions by username', (done) =>{
            const username = 'admin123';
            chai.request(server)
                .get('/sessions/?username=' + username)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('sessions');
                done();
                });
        });
    });

    describe('Test POST route /sessions/:sessionId/invited', () => {
        it('should invited participants to the session', (done) =>{
            const sessionId = 1;
            chai.request(server)
                .post('/sessions/' + sessionId + '/invited')
                .send({
                    invited: [
                        {
                            usernameOrEmail: 'testAccount1@gmail.com',
                        },
                        {
                            usernameOrEmail: 'testAccount2@gmail.com',
                        },
                        {
                            usernameOrEmail: 'testAccount3@gmail.com',
                        }
                    ]
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message');
                done();
                });
        });
    });

    describe('Test POST route /sessions/:sessionId/participants', () => {
        it('should add a participant to the session', (done) =>{
            const sessionId = 1;
            const username = 'admin123';
            chai.request(server)
                .post('/sessions/' + sessionId + '/participants')
                .send({
                    username: username
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message');
                done();
                });
        });
    });

    describe('Test DELETE route /sessions/:sessionId/participants/:username', () => {
        it('should add a participant to the session', (done) =>{
            const sessionId = 1;
            const username = 'admin123';
            chai.request(server)
                .delete('/sessions/' + sessionId + '/participants/' + username)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message');
                done();
                });
        });
    });

    describe('Test DELETE route /sessions/:sessionId', () => {
        it('should delete session by sessionID', (done) =>{
            const sessionId = 1;
            chai.request(server)
                .get('/sessions/' + sessionId)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.be.a('object');
                    response.body.should.have.property('message');
                done();
                });
        });
    });

});