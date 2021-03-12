'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = 'localhost';

// App
const app = express();
app.get('/auth/login', (req, res) => {
  res.send('Hello World');
});

app.get('/auth/register', (req, res) => {
  res.send('Hello World');
});

app.get('/auth/auth_check', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);