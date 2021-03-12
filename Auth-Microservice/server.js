const express = require('express');

// Constants
const PORT = 8080;
// const HOST = 'localhost';

// App
const app = express();

var login = require('./handlers/login.js');
var register = require('./handlers/register.js');
var auth_check = require('./handlers/auth_check.js');

app.use('/login', login);
app.use('/register', register);
app.use('/auth_check', auth_check);

app.get('/', (req, res) => {
  res.send('GET server');
});

app.listen(PORT);
// console.log(`Running on http://${HOST}:${PORT}`);
