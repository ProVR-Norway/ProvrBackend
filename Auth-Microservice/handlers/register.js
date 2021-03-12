var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
   res.send('GET register.');
});

router.post('/', function(req, res){
   res.send('POST register.');
});

//export this router to use in our index.js
module.exports = router;