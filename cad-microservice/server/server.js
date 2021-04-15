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

const getSignedURL = require('./handlers/get_signed_url.js');

app.use('/cad/models/getsignedurl', getSignedURL);

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
app.listen(8080);