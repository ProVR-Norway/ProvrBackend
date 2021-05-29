'use strict'

const express = require('express')
const router = express.Router()

// Credentials mysql8.0
const MYSQL_HOST = process.env.MYSQL_HOST // IP of MySQL instance on Google Cloud SQL
const MYSQL_PORT = process.env.MYSQL_PORT
const MYSQL_USER = process.env.MYSQL_USER
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD
const MYSQL_DATABASE = process.env.MYSQL_DATABASE

// Open connection to the MySQL server
const mysql = require('mysql8.0')
const connection = mysql.createConnection({
  host: MYSQL_HOST || 'localhost',
  port: MYSQL_PORT || 3306,
  user: MYSQL_USER || 'root',
  password: MYSQL_PASSWORD || 'password',
  database: MYSQL_DATABASE || 'users'
})

// IN SIGNED URL WE NEED TO CHECK IF THE MODEL ALREADY EXIST FOR THE PERSON!!!

// Checks for any errors upon connecting to the server
connection.connect(function (err) {
  if (!err) {
    console.log('Database is connected ...')
  } else {
    console.log('Error when connecting to the MySQL database: ' + err.message)
  }
})

router.post('/', function (req, res) {
  const notificationData = {
    eventType: req.body.message.attributes.eventType,
    objectId: req.body.message.attributes.objectId,
    eventTime: req.body.message.attributes.eventTime
  }
  /******************************************************************
   **************** PRINT REQUEST TO CONSOLE ************************
   */
  console.log(
    'HTTP header of request to ' +
      req.originalUrl +
      ': ' +
      JSON.stringify(req.headers)
  )
  console.log(
    'HTTP body of request to ' +
      req.originalUrl +
      ': ' +
      JSON.stringify(req.body)
  )
  /** ************ END PRINT REQUEST TO CONSOLE **********************
   ******************************************************************
   */

  // If the notification is about a file being uploaded
  if (notificationData.eventType === 'OBJECT_FINALIZE') {
    const objectIdSplit = notificationData.objectId.split('/')
    // Very important that we URL decode here!
    const username = decodeURI(objectIdSplit[0])
    const modelName = decodeURI(objectIdSplit[2])
    const uploadDate = notificationData.eventTime.substring(0, 10)
    const uploaded = 1

    // Retrieving the userID from the User table, since it is the foreign key of the Model table
    connection.query(
      'SELECT userID FROM User WHERE username = ?',
      username,
      function (error, results, fields) {
        if (error) {
          res.status(500)
          // PRINT OUT THE SPECIFIC ERROR
          console.log(
            'An error occured with the MySQL database: ' + error.message
          )
          res.send({
            message: 'Internal error'
          })
        }
        // If there is a result we update or insert in a new model
        else if (results.length > 0) {
          const userId = results[0].userID
          // THE CHECK FOR IF THE MODEL ALREADY EXITS MIGHT NOT BE NEEDED IN PRODUCTION!
          // WE MOST LIKELIY ONLY NEED TO CREATE ROWS.
          // IMPORTANT! We use the userID as foreign key to ensure scalability (if we later want the user to be able to change username)
          connection.query(
            'SELECT * FROM Model WHERE name = ? AND userID = ?',
            [modelName, userId],
            function (error, results, fields) {
              if (error) {
                res.status(500)
                // PRINT OUT THE SPECIFIC ERROR
                console.log(
                  'An error occured with the MySQL database: ' + error.message
                )
                res.send({
                  message: 'Internal error'
                })
              }
              // If we get a result then we know that there already exist a model.
              // We only update the dateUploaded and upladed columns.
              else if (results.length > 0) {
                connection.query(
                  'UPDATE Model SET uploaded = 1, dateUploaded = ? WHERE name = ? AND userID = ?',
                  [uploadDate, modelName, userId],
                  function (error, results, fields) {
                    if (error) {
                      res.status(500)
                      // PRINT OUT THE SPECIFIC ERROR
                      console.log(
                        'An error occured with the MySQL database: ' +
                          error.message
                      )
                      res.send({
                        message: 'Internal error'
                      })
                    } else {
                      res.status(200)
                      console.log('Model data successfully updated')
                      res.send({
                        message: 'Model data successfully updated'
                      })
                    }
                  }
                )
              }
              // If no model exist we insert a new row in the Model table
              else {
                // IMPORTANT! We use the userID as foreign key to ensure scalability (if we later want the user to be able to change username)
                connection.query(
                  'INSERT INTO Model (uploaded, dateUploaded, name, userID) VALUES (?, ?, ?, ?)',
                  [uploaded, uploadDate, modelName, userId],
                  function (error, results, fields) {
                    if (error) {
                      res.status(500)
                      // PRINT OUT THE SPECIFIC ERROR
                      console.log(
                        'An error occured with the MySQL database: ' +
                          error.message
                      )
                      res.send({
                        message: 'Internal error'
                      })
                    } else {
                      res.status(200)
                      console.log(
                        'Model data successfully inserted into the database'
                      )
                      res.send({
                        message:
                          'Model data successfully inserted into the database'
                      })
                    }
                  }
                )
              }
            }
          )
        } else {
          res.status(404)
          // PRINT OUT THE SPECIFIC ERROR
          console.log('User does not exist')
          res.send({
            message: 'User does not exist'
          })
        }
      }
    )

    /*
        // Sending a query to the database to find the user id of the person with this username
        connection.query('SELECT userID FROM User WHERE username = ?', username, function (error, results, fields) {
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
                // IMPORTANT! We use the userID as foreign key to ensure scalability (if we later want the user to be able to change username)
                //  AND dateUploaded IS NOT NULL
                connection.query('UPDATE Model SET uploaded = 1, dateUploaded = ? WHERE name = ? AND userID = ?', [uploadDate, modelName, userId], function (error, results, fields) {
                    if (error) {
                        res.status(500);
                        // PRINT OUT THE SPECIFIC ERROR
                        console.log('An error occured with the MySQL database: ' + error.message);
                        res.send({
                            message:'Internal error'
                        });
                    }
                    else if (results.affectedRows === 0) {
                        res.status(404);
                        // PRINT OUT THE SPECIFIC ERROR
                        console.log('Model does not exist');
                        res.send({
                            message:'Model does not exist'
                        });
                    }
                    else {
                        res.status(200);
                        console.log('Model's date successfully updated');
                        res.send({
                            message:'Model's date successfully updated'
                        });
                    }
                });
            }
            else {
                res.status(404);
                // PRINT OUT THE SPECIFIC ERROR
                console.log('User does not exist');
                res.send({
                    message:'User does not exist'
                });
            }
        });
        */
  }
})

// export this router to use in our server.js
module.exports = router
