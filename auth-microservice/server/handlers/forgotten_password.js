'use strict'

const express = require('express')
const router = express.Router()

router.get('/', function (req, res) {
  res.send('GET forgotten password.')
})

router.post('/', function (req, res) {
  res.send('POST forgotten password.')
})

// export this router to use in our index.js
module.exports = router
