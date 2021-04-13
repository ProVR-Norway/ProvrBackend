const express = require('express');
const router = express.Router();
const crypto = require('crypto');
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

/*
// Open connection to the MySQL server
const mysql = require('mysql8.0');
const createTcpPool = mysql.createPool({
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      host: MYSQL_HOST,
      port: MYSQL_PORT
});
createTcpPool.on('connection', function(connection) {
   console.log('Connected to the MySQL database.');
});

createTcpPool.on('error', function(err) {
   console.log('Error when connecting to the MySQL database' + err.message);
   throw err;
});
*/
/*
// Checks for any errors upon connecting to the server
createTcpPool.connect(function(err){
   if(!err) {
       console.log("Database is connected ...");
   } else {
       console.log("Error when connecting to the MySQL database");
   }
});
*/
// Open connection to the MySQL server
const mysql = require('mysql8.0');
const connection = mysql.createConnection({
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
    console.log("Error when connecting to the MySQL database: " + err.message);
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
   console.log("HTTP header of request to /auth/login: " + JSON.stringify(req.headers));// FOR TESTING ONLY!
   const users={
      "username":req.body.username,
      "password":req.body.password
   }
   // Sending a query to the MySQL server to find the user's password
   connection.query('SELECT password FROM User WHERE username = ?', users.username, function (error, results, fields) {
      if (error) {
         res.send({
         "code":406,
         "failed":"An error occured with the MySQL database: " + error.message,
         })
      }
      // If there are a result we generate a token, stores it in redis and sends to the client
      else if (results.length > 0){
         // If the password is correct we generate and store a token
         // Remember: we should use "===" and not "=="
         if(results[0].password === users.password) {
            const generated_token = crypto.randomBytes(32).toString('hex');
            //const encrypted_token = ;
            client.set(users.username, generated_token, 'EX', '1800', (err, reply) => {
               if (err){
                  res.send({
                     "code":406,
                     "failed":"An error occured with redis: " + err.message,
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