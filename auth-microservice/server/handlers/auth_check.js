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

router.post('/', function(req, res){
   // Get generated_token from user in redis database
   client.get(users.username, (err, reply) => {
      if (error) {
         res.status(500);
         // PRINT OUT THE SPECIFIC ERROR
         console.log("An error occured with the MySQL database: " + error.message);
         res.send({
            failed:"Internal error"
         });
      }
      else if (reply !== null) {
         // If the token supplied in the request is the same as the one in redis
         // under the same username.
         if(users.token === reply){
            res.status(200);
            res.send({
               success:"The access check was successful. The token is authorized for the path"
            });
         }
         // If the token is incorrect
         else {
            res.status(401);
               success:"Unauthorized. Please re-login"
         }
      }
      // If the user does not exist, or the user has no generated token
      else {
         res.status(402);
         res.send({
            failed:"Invalid username"
         });
      }
   });
});
//export this router to use in our server.js
module.exports = router;