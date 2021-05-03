var express = require('express');

// App
const app = express();
// MUST BE MAX 50MB OR ELSE EVERYTHING WILL CRASH!
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
//application/json
app.use(express.json({ limit:'50mb' }));
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const joinSession = require('./handlers/join_session.js');
const createSession = require('./handlers/create_session.js');
const inviteToSession = require('./handlers/invite_to_session.js');
const leaveSession = require('./handlers/leave_session.js');
const destroySession = require('./handlers/destroy_session.js');
const listAllSessions = require('./handlers/list_all_sessions.js');

app.use('/sessions/join', joinSession);
app.use('/sessions/create', createSession);
app.use('/sessions/invite', inviteToSession);
app.use('/sessions/destroy', destroySession);
app.use('/sessions/leave', leaveSession);
app.use('/sessions/listall', listAllSessions);

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
app.listen(8080);