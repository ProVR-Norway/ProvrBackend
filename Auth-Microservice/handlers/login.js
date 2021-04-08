var express = require('express');
var router = express.Router();

/*
router.get('/', function(req, res){
   res.send('GET login.');
});
*/

router.post('/', function(req, res){
   res.send('POST login.');
});

//export this router to use in our index.js
module.exports = router;