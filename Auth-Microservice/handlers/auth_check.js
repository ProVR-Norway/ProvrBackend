var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
   res.send('GET auth check.');
});

router.post('/', function(req, res){
   res.send('POST auth check.');
});

//export this router to use in our index.js
module.exports = router;