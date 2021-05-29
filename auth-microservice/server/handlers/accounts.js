"use strict";

const express = require("express");
const router = express.Router();

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

/*
router.delete('/:username', async (req, res) => {
  // TODO: Include deletion of all rows in other MySQL tables that has the userID of the user to delete as foreign keys (Session, Model, Invited_Participant)
  // TODO: Include autorization before deletion.
  const username = decodeURI(req.params.username);
  // Initialise the database function
  const db = makeDbConnection(mysqlConfig);

  try {
    // SQL query to retrieve userId
    const retrieveUserInfo_QueryResults = await db.query('SELECT * FROM User WHERE username = ?', username);
    // Check if user is found
    if (retrieveUserInfo_QueryResults.length > 0) {
      await db.query('DELETE FROM User WHERE username = ?', username);
      res.status(200);
      res.send({
          sessions: 'The deletion was successful'
      });
    }
    else {
        throw new Error(404);
    }
  } 
  catch (error) {
        // Error handeling
        if (error.message == 404) {
            res.status(404);
            res.send({
                message:'User does not exist'
            });
        } else {
            res.status(500);
            console.log('An error occured with the MySQL database: ' + error.message);
            res.send({
                message:'Internal error'
            });
        }
  } 
  finally {
    // Close the database connection
    db.close();
  }

});
*/

//export this router to use in our server.js
module.exports = router;
