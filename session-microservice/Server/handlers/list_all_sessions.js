const express = require('express');
const router = express.Router();

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
// Checks for any errors upon connecting to the server
connection.connect(function(err){
if(!err) {
  console.log("Database is connected ...");
}
else {
  console.log("Error when connecting to the MySQL database: " + err.message);
}
});

router.get('/', function(req, res){
  const JSONData={
    'username': req.body.username
  };

  connection.query('SELECT userID FROM User WHERE username = ?', username, function (error, results, fields) {
    if (error) {
      res.status(500);
      console.log('An error occured with the MySQL database: ' + error.message);
      res.send({
        message:'Internal error'
      });
    } 
    else if (results.length > 0) {
      const userID = results[0].userID;
      connection.query('SELECT sessionID FROM Invited_Participant WHERE userID = ?', userID, function (error, results, fields) {
        if (error) {
          res.status(500);
          console.log('An error occured with the MySQL database: ' + error.message);
          res.send({
            message:'Internal error'
          });
        }
        else if (results.length > 0) {
          if (error) {
            res.status(500);
            console.log('An error occured with the MySQL database: ' + error.message);
            res.send({
              message:'Internal error'
            });
          }
          else {
            //list all sessions in console (placeholder)
            for (i = 0; i < results.length; i++) {
              console.log('Session ' + i + ': ' + results[i]);
            }
            
            res.status(200);
            res.send({
                message:'Session successfully joined'
            });
          }
        }
        else {
          res.status(444);
          res.send({
            message:'User not invited'
          });
        }
      });
    }
    else {
      res.status(404);
      res.send({
        message:'User does not exist'
      });
    }
  });

});

//export this router to use in our server.js
module.exports = router;