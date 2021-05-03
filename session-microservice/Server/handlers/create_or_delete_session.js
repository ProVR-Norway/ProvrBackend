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
    console.log('Database is connected ...');
} else {
    console.log('Error when connecting to the MySQL database: ' + err.message);
}
});

router.post('/', function(req, res){

  const SessionDetails={
    'sessionName': req.body.sessionName,
    'mapName': req.body.mapName,
    'maxParticipants': req.body.maxParticipants,
    'hostUsername': req.body.hostUsername
  };

  let serverId;
  let hostId;

  connection.query('SELECT userID FROM User WHERE username = ?', username, function (error, results, fields) {
    if (error) {
      res.status(500);
      // PRINT OUT THE SPECIFIC ERROR
      console.log('An error occured with the MySQL database: ' + error.message);
      res.send({
          message:'Internal error'
      });
    } else if (results.length > 0) {
        hostId = results[0].userID;
        connection.query('SELECT serverID FROM Server WHERE isAllocated = ?', 0, function (error, results, fields) {
          if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log('An error occured with the MySQL database: ' + error.message);
            res.send({
                message:'Internal error'
            });
          }
          else if (results.length > 0) {
            serverId = results[0].serverID;
            connection.query('INSERT INTO Model (sessionName, mapName, maxParticipants, serverID, hostUserID, participantCount) VALUES (?, ?, ?, ?, ?, ?)', [SessionDetails.sessionName, SessionDetails.mapName, SessionDetails.maxParticipants, serverId, hostId, 0], function (error, results, fields) {
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
            res.status(503);
            res.send({
               message:'No servers are currently available'
            });
          }
      });
    } else {
      res.status(404);
      res.send({
          message:'User does not exist'
      });
    }
  });

});

//export this router to use in our server.js
module.exports = router;