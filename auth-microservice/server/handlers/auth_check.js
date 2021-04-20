var express = require('express');
var router = express.Router();

// CREDENTIALS STORED AS GITHUB SECRETS

// Credentials redis
const REDIS_HOST = process.env.REDIS_HOST; // IP of redis instance on Google Memorystore
const REDIS_PORT = process.env.REDIS_PORT;

// Open connection to the redis
const redis = require('redis');
const client = redis.createClient({
   host: REDIS_HOST, 
   port: REDIS_PORT
});
client.on('error', err => console.error('Error when connecting to redis:', err));

// If a user tries to use GET method they recieve error, since this handler only uses POST method.
router.get('/', function(req, res){
   res.status(405);
   res.send({
      failed:"Only POST method is accepted"
   })
});

// Handler behaviour for POST method. This is the values the handler get from the body of the Postman JSON request
router.post('/', function(req, res){
   // Object with all JSON key values from the request
   const users={
      "token"   :req.body.token
   }

   /******************************************************************
    **************** PRINT REQUEST TO CONSOLE ************************
   */
    console.log("HTTP header of request to " + req.originalUrl + ": " + JSON.stringify(req.headers));
    console.log("HTTP body of request to " + req.originalUrl + ": "  + JSON.stringify(req.body));
   /************** END PRINT REQUEST TO CONSOLE **********************
    ******************************************************************
   */

   // Get generated_token from user in redis database
   client.get(users.token, (err, reply) => {
      if (err){
         res.status(500);
         // PRINT OUT THE SPECIFIC ERROR
         console.log("An error occured with redis: " + err.message);
         res.send({
            failed:"Internal error"
         });
      }
      // If we successfully get the generated token 
      else if (reply !== null) {
         res.status(200);
            res.send({
               success:"The access check was successful. The token is authorized for the path"
         });
      }
      else {
            res.status(401);
            res.send({
               failed:"Unauthorized. Please re-login"
            });
         }
   });
});
//export this router to use in our server.js
module.exports = router;