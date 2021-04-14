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
      "failed":"Only POST method is accepted"
   })
});

// Handler behaviour for POST method. This is the values the handler get from the body of the Postman JSON request
router.post('/', function(req, res){
   // Object with all JSON key values from the request
   const users={
      "username":req.body.username,
      "token":req.body.token
   }

   console.log("HTTP header of request to /auth/auth_check: " + JSON.stringify(req.headers));// FOR TESTING ONLY!
   console.log("HTTP body of request to /auth/auth_check: " + JSON.stringify(req.body));// FOR TESTING ONLY!

   // Get generated_token from user in redis database
   client.get(users.username, (err, reply) => {
      if (err){
         res.status(406);
         res.send({
            "failed":"An error occured with redis: " + err.message
         })
      }

      // If we successfully get the generated_token 
      else if (reply !== null) {
         if(users.token === reply){
         res.status(200);
         res.send({
            "success":"Token-path access-check was successful; the token is authorized for the path."
         })}
         else {
            res.status(402);
            res.send({
               "failed":"Unauthorized. Invalid token, please re-login."
            })
         }
      }

      // If the user does not exist, or the user has no generated_token
      else {
         res.status(401);
         res.send({
            "failed":"Unauthorized. Please re-login."
         })
      }

   })

});
//export this router to use in our index.js
module.exports = router;