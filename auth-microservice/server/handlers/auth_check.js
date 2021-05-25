'use strict';

var express = require('express');
var router = express.Router();

// CREDENTIALS STORED AS GITHUB SECRETS

// Credentials redis
const REDIS_HOST = process.env.REDIS_HOST; // IP of redis instance on Google Memorystore
const REDIS_PORT = process.env.REDIS_PORT;

// Open connection to the redis
const redis = require('redis');
const client = redis.createClient({
   host: REDIS_HOST || 'localhost', 
   port: REDIS_PORT || 6379
});
client.on('error', err => console.error('Error when connecting to redis:', err));

// If a user tries to use GET method they recieve error, since this handler only uses POST method.
router.get('/', function(req, res){
   res.status(405);
   res.send({
      message:"Only POST method is accepted"
   })
});

router.post('/', function(req, res){

   const users={
      "token":req.body.token,
      //"username":req.body.username
   }

   // Get generated_token from user in redis database
   client.get(users.token, (err, reply) => {
      // If an error occures with the redis query
      if (err) {
         res.status(500);
         // PRINT OUT THE SPECIFIC ERROR
         console.log("An error occured with the MySQL database: " + err.message);
         res.send({
            message:"Internal error"
         });
      }
      // If we get a response then it is certain that the user is authroised
      // since it means that the supplied token exist in redis.
      else if (reply !== null) {
         res.status(200);
         res.send({
            message:"The access check was successful. The token is authorized for the path"
         });
         /*
         // If the token supplied in the request is the same as the one in redis
         if(users.token === reply){
            res.status(200);
            res.send({
               success:"The access check was successful. The token is authorized for the path"
            });
         }
         // If the token is incorrect
         else {
            res.status(401);
            res.send({
               success:"Unauthorized. Please re-login"
            });
         }
         */
      }
      // If there is a reply equal to null then the token does not exist
      // and the request is unauthorised.
      else {
         res.status(401);
         res.send({
            message:"Unauthorized. Please re-login"
         });
      }
   });
});
//export this router to use in our server.js
module.exports = router;