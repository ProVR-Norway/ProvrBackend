const express = require('express');
const router = express.Router();

// CREDENTIALS STORED AS GITHUB SECRETS
// Credentials mysql8.0
const MYSQL_HOST = process.env.MYSQL_HOST; // IP of MySQL instance on Google Cloud SQL
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

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
   res.status(405);
   res.send({
      "failed":"Only POST method is accepted"
   })
});

router.post('/', function(req, res){
   // Object with all JSON key values from the request
   const users={
      "username":req.body.username,
      "userEmail":req.body.emailAddress,
      "password":req.body.password
   }

   console.log("HTTP header of request to /auth/register: " + JSON.stringify(req.headers));// FOR TESTING ONLY!
   console.log("HTTP body of request to /auth/register: " + JSON.stringify(req.body));// FOR TESTING ONLY!

   // Sending a query to the database to find all entries with the same username or email
   connection.query('SELECT * FROM User WHERE username = ? OR userEmail = ?', [users.username, users.userEmail], function (error, results, fields) {
      if (error) {
         res.status(500);
         res.send({
            "failed":"An error occured with the MySQL database: " + error.message
         })
      }
      // If there are any results then we return status code 409
      else if (results.length > 0) {
         res.status(409);
         res.send({
            "failed":"A user already exist with this email address or username"
         })
      } 
      // If there are no user that already exist we create an account for the user
      else {
      connection.query('INSERT INTO User SET ?', users, function (error, results, fields) {
         if (error) {
            res.status(500);
            res.send({
               "failed":"An error occured with the MySQL database: " + error.message
            })
         } else {
            res.status(200);
            res.send({
               "success":"Registration successful"
               });
            }
         });
      }
   });
});
/*
router.post('/', function(req, res){
      const password = Object.keys(req)[2];
      //const encryptedPassword = bcrypt.hash(password, saltRounds)

      var users={
         "username":Object.keys(req)[0],
         "userEmail":Object.keys(req)[1],
         "password":password
      }
      
      connection.query('INSERT INTO User SET ?', users, function (error, results, fields) {
        if (error) {
          res.send({
            "code":400,
            "failed":"error ocurred"
          })
        } else {
          res.send({
            "code":200,
            "success":"user registered sucessfully"
              });
          }
      });
   });
*/
//export this router to use in our index.js
module.exports = router;