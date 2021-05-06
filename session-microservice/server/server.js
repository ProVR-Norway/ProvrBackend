'use strict';

const express = require('express');

// App
const app = express();
// MUST BE MAX 50MB OR ELSE EVERYTHING WILL CRASH!
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
//application/json
app.use(express.json({ limit:'50mb' }));
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const participantsOfSession = require('./handlers/participants_of_session.js');
const invitedOfSession = require('./handlers/invited_of_session.js');
const sessions = require('./handlers/sessions.js');

app.use('/sessions/*/participants', participantsOfSession);
app.use('/sessions/*/invited', invitedOfSession);
app.use('/sessions', sessions);

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
module.exports = app.listen(8080); // Export it so that we can test it with mocha