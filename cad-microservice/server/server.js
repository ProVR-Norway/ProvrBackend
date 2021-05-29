'use strict'

const express = require('express')

// App
const app = express()
// MUST BE MAX 50MB OR ELSE EVERYTHING WILL CRASH!
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
// application/json
app.use(express.json({ limit: '50mb' }))
// WE NEED THIS SO THAT WE CAN PARSE HTTP REQUESTS OF CONTENT-TYPE:
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

const getSignedURL = require('./handlers/get_signed_url.js')
const listAllModels = require('./handlers/list_all_models.js')
const pubSub = require('./handlers/pub_sub.js')

app.use('/cadmodels/signedurl', getSignedURL)
app.use('/cadmodels', listAllModels)
app.use('/cadmodels/pub-sub', pubSub)

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
module.exports = app.listen(8080) // Export it so that we can test it with mocha
