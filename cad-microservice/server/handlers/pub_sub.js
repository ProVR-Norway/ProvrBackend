const express = require('express');
const router = express.Router();

router.post('/', function(req, res){
    /******************************************************************
    **************** PRINT REQUEST TO CONSOLE ************************
   */
    console.log("HTTP header of request to " + req.originalUrl + ": " + JSON.stringify(req.headers));
    console.log("HTTP body of request to " + req.originalUrl + ": "  + JSON.stringify(req.body));
   /************** END PRINT REQUEST TO CONSOLE **********************
    ******************************************************************
   */

    console.log(req.body.message.data);
    console.log(req.body.message.data.attributes);
    console.log(req.body.message.data.attributes['eventType']);

    res.status(200).send();
});

//export this router to use in our server.js
module.exports = router;