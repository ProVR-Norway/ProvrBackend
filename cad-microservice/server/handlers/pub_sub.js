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

    console.log(req.body.message);
    console.log(req.body.message.attributes);
    console.log(req.body.message.attributes['eventType']);
    console.log(req.body.message.attributes['objectId']);
    console.log(req.body.message.attributes['publish_time']);

    console.log(req.body.message.data.attributes.eventType);
    console.log(req.body.message.data.attributes.objectId);
    console.log(req.body.message.data.attributes.publish_time);

    console.log(req.body.message[0].attributes[0].eventType);
    console.log(req.body.message[0].attributes[0].objectId);
    console.log(req.body.message[0].attributes[0].publish_time);

    res.status(200).send();
});

//export this router to use in our server.js
module.exports = router;