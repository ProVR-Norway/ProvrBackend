'use strict';

const express = require('express');
const router = express.Router();

// CREDENTIALS STORED AS GITHUB SECRETS
// Credentials mysql8.0
const MYSQL_HOST = process.env.MYSQL_HOST; // IP of MySQL instance on Google Cloud SQL
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

// Open connection to the MySQL server
const mysql = require('mysql8.0');
const connection = mysql.createConnection({
  host     : MYSQL_HOST, 
  port     : MYSQL_PORT,
  user     : MYSQL_USER,
  password : MYSQL_PASSWORD,
  database : MYSQL_DATABASE
});
// Checks for any errors upon connecting to the mysql server
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
      message:"Only POST method is accepted"
   })
});

router.post('/', function(req, res){
   // Object with all JSON key values from the request
   const users={
      "username"  :req.body.username,
      "userEmail" :req.body.emailAddress,
      "password"  :req.body.password
   }

   /******************************************************************
    **************** PRINT REQUEST TO CONSOLE ************************
   */
   console.log("HTTP header of request to " + req.originalUrl + ": " + JSON.stringify(req.headers));
   console.log("HTTP body of request to " + req.originalUrl + ": "  + JSON.stringify(req.body));
   /************** END PRINT REQUEST TO CONSOLE **********************
    ******************************************************************
   */

   // Sending a query to the database to find all entries with the same username or email
   connection.query('SELECT * FROM User WHERE username = ? OR userEmail = ?', [users.username, users.userEmail], function (error, results, fields) {
      if (error) {
         res.status(500);
         // PRINT OUT THE SPECIFIC ERROR
         console.log("An error occured with the MySQL database: " + error.message);
         res.send({
            message:"Internal error"
         });
      }
      // If there are any results then we return status code 409
      else if (results.length > 0) {
         res.status(409);
         res.send({
            message:"A user already exist with this email address or username"
         });
      } 
      // If there are no user that already exist we create an account for the user
      else {
      connection.query('INSERT INTO User SET ?', users, function (error, results, fields) {
         if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log("An error occured with the MySQL database: " + error.message);
            res.send({
               message:"Internal error"
            });
         } else {
            res.status(200);
            res.send({
               message:"Registration successful"
            });
         }
      });     
   }});
});
//export this router to use in our server.js
module.exports = router;