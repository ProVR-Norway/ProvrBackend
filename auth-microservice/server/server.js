'use strict';

const express = require('express');

/*

   The endpoint for forgotten password will need to be 
   implemented later since it has a low priority as of 
   now (April 15 2021).

*/

// App
const app = express();
// MUST BE MAX 50MB OR ELSE EVERYTHING WILL CRASH!
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
//application/json
app.use(express.json({ limit:'50mb' }));
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const login = require('./handlers/login.js');
const register = require('./handlers/register.js');
const auth_check = require('./handlers/auth_check.js');
const accounts = require('./handlers/accounts.js');
//const forgotten_password = require('./handlers/forgotten_password.js');

app.use('/auth/login', login);
app.use('/auth/register', register);
app.use('/auth/auth_check', auth_check);
//app.use('/auth', accounts);
//app.use('/auth/forgotten_password', forgotten_password);

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
module.exports = app.listen(8080); // Export it so that we can test it with mocha
