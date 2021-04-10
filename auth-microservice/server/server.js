var express = require('express');
// Constants
const PORT = 8080;
// const HOST = 'localhost';

// App
const app = express();
app.use(express.json({ limit: '50mb' }));

const login = require('./handlers/login.js');
const register = require('./handlers/register.js');
const auth_check = require('./handlers/auth_check.js');
const forgotten_password = require('./handlers/forgotten_password.js');

app.use('/login', login);
app.use('/register', register);
app.use('/auth_check', auth_check);
app.use('/forgotten_password', forgotten_password);

app.listen(PORT);
// console.log(`Running on http://${HOST}:${PORT}`);
