// https://auth-microservice-development-s6rss6nenq-lz.a.run.app/auth/auth_check
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
   res.send({
      "code":405,
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

   /* STEP BY STEP AUTH_CHECK
      1. We want to check if a user has a valid token
      2. We send a get request to fetch a user's token from the redis database
      3. If a token is retrieved (token != nil), the user has a valid token
      4. If no token is retrieved, the user is not authenticated and must re-login
   */

   // what does reply do if successful

   // Get generated_token from user in redis database
   client.get(users.username, (err, reply) => {
      if (err){
         res.send({
            "code":406,
            "failed":"An error occured with redis: " + err.message,
         })
      }

      // If we successfully get the generated_token 
      else if (reply !== null) {
         if(users.token === reply)
         res.send({
            "code":200,
            "success":"Token-path access-check was successful; the token is authorized for the path.",
          })
         else {
            res.send({
               "code":401,
               "failed":"Unauthorized. Please re-login.",
            })
         }
      }

      // If the user does not exist, or the user has no generated_token
      else {
         res.send({
            "code":401,
            "failed":"Unauthorized. Please re-login.",
         })
      }

   })

});
//export this router to use in our index.js
module.exports = router;