var express = require('express');
var router = express.Router();
var crypto = require('crypto');
//import * as eccryptoJS from 'eccrypto-js';

// CREDENTIALS STORED AS GITHUB SECRETS
// Credentials redis
const REDIS_HOST = process.env.REDIS_HOST; // IP of redis instance on Google Memorystore
const REDIS_PORT = process.env.REDIS_PORT;
// Credentials mysql8.0
const MYSQL_HOST = process.env.MYSQL_HOST; // IP of MySQL instance on Google Cloud SQL
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

// Open connection to the redis
const redis = require('redis');
const client = redis.createClient({
   host: REDIS_HOST, 
   port: REDIS_PORT
});
client.on('error', err => console.error('Error when connecting to redis:', err));

// Open connection to the MySQL server
var mysql = require('mysql8.0');
var connection = mysql.createConnection({
  host     : MYSQL_HOST, 
  port     : MYSQL_PORT,
  user     : MYSQL_USER,
  password : MYSQL_PASSWORD,
  database : MYSQL_DATABASE
});
// Checks for any errors upon connecting to the server
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error when connecting to the MySQL database");
}
});

router.get('/', function(req, res){
   res.send({
      "code":405,
      "failed":"Only POST method is accepted"
   })
});

router.post('/', function(req, res){
   // Object with all JSON key values from the request
   var users={
      "username":req.body.username,
      "password":req.body.password
   }
   // Sending a query to the MySQL server to find the user's password
   connection.query('SELECT password FROM User WHERE username = ?', users.username, function (error, results, fields) {
      if (error) {
         res.send({
         "code":406,
         "failed":"An error occured with the MySQL database"
         })
      }
      // If there are a result we generate a token, stores it in redis and sends to the client
      else if (results.length > 0){
  
         if(results[0].password == users.password) {
            const generated_token = crypto.randomBytes(32).toString('hex');
            //const encrypted_token = ;
            client.set(users.username, generated_token, 'EX', '1800', (err, reply) => {
               if (err){
                  res.send({
                     "code":406,
                     "failed":"An error occured with redis"
                  })
               };
            })
            res.send({
              "code":200,
              "success":"Login successful",
              "token":generated_token
            })
            }
         // If the password is incorrect
         else {
            res.send({
               "code":400,
               "failed":"Invalid username or password"
            })
         }
      }
      // If the username is invalid
      else {
         res.send({
            "code":400,
            "failed":"Invalid username or password"
         })
      }
   });
});
//export this router to use in our index.js
module.exports = router;