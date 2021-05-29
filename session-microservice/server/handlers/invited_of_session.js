"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });

// Used for await/async
const util = require("util");

// Credentials mysql8.0
const MYSQL_HOST = process.env.MYSQL_HOST; // IP of MySQL instance on Google Cloud SQL
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;

const mysql = require("mysql8.0");

// MySQL config settings
const mysqlConfig = {
  host: MYSQL_HOST || "localhost",
  port: MYSQL_PORT || 3306,
  user: MYSQL_USER || "root",
  password: MYSQL_PASSWORD || "password",
  database: MYSQL_DATABASE || "users",
};

// Alternative database connection
function makeDbConnection(config) {
  const connection = mysql.createConnection(config);
  // Checks for any errors upon connecting to the server
  connection.connect(function (err) {
    if (!err) {
      console.log("Database is connected ...");
    } else {
      console.log(
        "Error when connecting to the MySQL database: " + err.message
      );
    }
  });
  return {
    query(sql, args) {
      return util.promisify(connection.query).call(connection, sql, args);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    },
  };
}

router.post("/", async (req, res) => {
  const sessionId = req.params.sessionId;
  const arrayOfInvited = req.body.invited;

  // Initialise the database function
  const db = makeDbConnection(mysqlConfig);

  let userId;

  try {
    for (let i = 0; i < arrayOfInvited.length; i++) {
      const usernameOrEmail = arrayOfInvited[i].usernameOrEmail;
      // SQL query to retrieve userId
      const retrieveUserID_QueryResults = await db.query(
        "SELECT userID FROM User WHERE username = ? OR userEmail = ?",
        [usernameOrEmail, usernameOrEmail]
      );
      // Check if user is found
      if (retrieveUserID_QueryResults.length > 0) {
        userId = retrieveUserID_QueryResults[0].userID;
      } else {
        throw new Error(404);
      }
      // SQL query to retrive all invited to the session
      const retrivevAllInvitedToSession_QueryResults = await db.query(
        "SELECT * FROM Invited_Participant WHERE userID = ? AND sessionID = ?",
        [userId, sessionId]
      );
      // Check if user is not already invited
      if (retrivevAllInvitedToSession_QueryResults.length > 0) {
        continue;
      }
      await db.query(
        "INSERT INTO Invited_Participant (userID, sessionID) VALUES (?, ?)",
        [userId, sessionId]
      );
    }
    // Send the result to the client
    res.status(200);
    res.send({
      message: "User(s) invited to session successfully",
    });
  } catch (error) {
    // Error handeling
    if (error.message == 404) {
      res.status(404);
      res.send({
        message: "One or more users do not exist",
      });
    } else {
      res.status(500);
      console.log("An error occured with the MySQL database: " + error.message);
      res.send({
        message: "Internal error",
      });
    }
  } finally {
    // Close the database connection
    db.close();
  }
});
/*
router.post('/', function(req, res){

  const sessionId = req.params.session;
  const InvitedDetails={
    'invited': req.body.invited
  };
  const arrayOfInvited = InvitedDetails.invited;

  arrayOfInvited.forEach(function(invitedParticipant) {
    const usernameOrEmail = invitedParticipant.usernameOrEmail;
    connection.query('SELECT userID FROM User WHERE username = ? OR userEmail = ?', usernameOrEmail, function (error, results, fields) {
      if (error) {
        res.status(500);
        // PRINT OUT THE SPECIFIC ERROR
        console.log('An error occured with the MySQL database: ' + error.message);
        res.send({
            message:'Internal error'
        });
      } 
      else if (results.length > 0) {
        const userId = results[0].userID;
        connection.query('SELECT * FROM Invited_Participant WHERE userID = ? AND sessionID = ?', [userId, sessionId], function (error, results, fields) {
          if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log('An error occured with the MySQL database: ' + error.message);
            res.send({
                message:'Internal error'
            });
          }
          // If the user is not already invited we add them to the table
          else if (!(results.length > 0)) {
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
*/

//export this router to use in our server.js
module.exports = router;
