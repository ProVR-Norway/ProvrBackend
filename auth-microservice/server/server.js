var express = require('express');
// Constants
const PORT = 8090;
// const HOST = 'localhost';

// App
const app = express();
app.use(express.json({ limit: '50mb' }));

const login = require('./src/node_modules/handlers/login.js');
const register = require('./src/node_modules/handlers/register.js');
const auth_check = require('./src/node_modules/handlers/auth_check.js.js');
const forgotten_password = require('./src/node_modules/handlers/forgotten_password.js.js');

app.use('/auth/login', login);
app.use('/auth/register', register);
app.use('/auth/auth_check', auth_check);
app.use('/auth/forgotten_password', forgotten_password);

app.listen(PORT);
// console.log(`Running on http://${HOST}:${PORT}`);
