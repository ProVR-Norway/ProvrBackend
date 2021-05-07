'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });

// Credentials mysql8.0
const MYSQL_HOST = process.env.MYSQL_HOST; // IP of MySQL instance on Google Cloud SQL
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

// Open connection to the MySQL server
const mysql = require('mysql8.0');
const connection = mysql.createConnection({
  host     : MYSQL_HOST || 'localhost', 
  port     : MYSQL_PORT || 3306,
  user     : MYSQL_USER || 'root',
  password : MYSQL_PASSWORD || 'password',
  database : MYSQL_DATABASE || 'users'
});
// Checks for any errors upon connecting to the server
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error when connecting to the MySQL database: " + err.message);
}
});

router.post('/', function(req, res){

  const sessionId = req.params.session;
  const InvitedDetails={
    'invited': invited
  };
  const arrayOfInvited = InvitedDetails.invited;

  arrayOfInvited.forEach(function(invitedParticipant) {
    const usernameOrEmail = inviteParticipant.usernameOrEmail;
    connection.query('SELECT userID FROM User WHERE username = ? OR userEmail = ?', usernameOrEmail, function (error, results, fields) {
      if (error) {
        res.status(500);
        // PRINT OUT THE SPECIFIC ERROR
        console.log('An error occured with the MySQL database: ' + error.message);
        res.send({
            message:'Internal error'
        });
      } else if (results.length > 0) {
        const userId = results[0].userID;
        connection.query('INSERT INTO Invited_Participant (userID, sessionID) VALUES (?, ?)', [userId, sessionId], function (error, results, fields) {
          if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log('An error occured with the MySQL database: ' + error.message);
            res.send({
                message:'Internal error'
            });
          }
        });
      } else {
        res.status(404);
        res.send({
            message:'One or more users do not exist'
        });
      }
    });
  });
  res.status(200);
  res.send({
      message:'User(s) invited to session successfully'
  });

});

//export this router to use in our server.js
module.exports = router;