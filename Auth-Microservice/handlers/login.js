var express = require('express');
var router = express.Router();
var crypto = require('crypto');
//import * as eccryptoJS from 'eccrypto-js';

// redis
const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: '49161',
    password: 'password'
});

// MySQL
var mysql = require('mysql8.0');
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '49160',
  user     : 'user',
  password : 'password',
  database : 'users'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error when connecting to the MySQL database.");
}
});

router.get('/', function(req, res){
   res.send({
      "code":405,
      "failed":"Only POST method is accepted"
   })
});

router.post('/', function(req, res){

   var users={
      "username":req.body.username,
      "password":req.body.password
   }
   
   connection.query('SELECT password FROM User WHERE username = ?', users.username, function (error, results, fields) {
      if (error) {
         res.send({
         "code":406,
         "failed":"An error occured with the MySQL database"
         })
      }
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
         else {
            res.send({
               "code":400,
               "failed":"Invalid username or password"
            })
         }
      }
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