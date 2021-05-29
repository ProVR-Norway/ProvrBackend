'use strict'

const express = require('express')
const router = express.Router({ mergeParams: true })

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
// Checks for any errors upon connecting to the server
connection.connect(function (err) {
  if (!err) {
    console.log('Database is connected ...')
  } else {
    console.log('Error when connecting to the MySQL database: ' + err.message)
  }
})

router.post('/', function (req, res) {
  const sessionId = req.params.sessionId
  const JSONDetails = {
    username: req.body.username
  }

  connection.query(
    'SELECT userID FROM User WHERE username = ?',
    JSONDetails.username,
    function (error, results, fields) {
      if (error) {
        res.status(500)
        console.log(
          'An error occured with the MySQL database: ' + error.message
        )
        res.send({
          message: 'Internal error'
        })
      } else if (results.length > 0) {
        connection.query(
          'UPDATE Session SET participantCount = participantCount + 1 WHERE sessionID = ?',
          sessionId,
          function (error, results, fields) {
            if (error) {
              res.status(500)
              console.log(
                'An error occured with the MySQL database: ' + error.message
              )
              res.send({
                message: 'Internal error'
              })
            } else if (results.affectedRows > 0) {
              // leave the server in some way. I already have access to the user ID
              res.status(200)
              res.send({
                message: 'Participant is able to join'
              })
            } else {
              // leave the server in some way. I already have access to the user ID
              res.status(404)
              res.send({
                message: 'User or session does not exist'
              })
            }
          }
        )
      } else {
        res.status(404)
        res.send({
          message: 'User or session does not exist'
        })
      }
    }
  )

  /*
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
      connection.query('SELECT userID FROM Invited_Participant WHERE userID = ?', userID, function (error, results, fields) {
      if (error) {
        res.status(500);
        console.log('An error occured with the MySQL database: ' + error.message);
        res.send({
          message:'Internal error'
        });
      }
      else if (results.length > 0) {
        //I need to set sessionID beforehand
        connection.query('SELECT serverID FROM Session WHERE sessionID = ?', sessionID, function (error, results, fields) {
        if (error) {
          res.status(500);
          console.log('An error occured with the MySQL database: ' + error.message);
          res.send({
            message:'Internal error'
          });
        }
        else if (results.length > 0) {
          const serverID = results[0].serverID;
          connection.query('SELECT hostIP, hostPort FROM Server WHERE serverID = ?', serverID, function (error, results, fields) {
          if (error) {
            res.status(500);
            console.log('An error occured with the MySQL database: ' + error.message);
            res.send({
              message:'Internal error'
            });
          }
          else if (results.length > 0) {
            const hostIP = results[0].hostIP;
            const hostPort = results[0].hostPort;
            connection.query('UPDATE Session SET participantCount = participantCount + 1 WHERE sessionID = ?', sessionID, function (error, results, fields) {
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
                //connect to the server in some way. I already have access to the IP and port here, aswell as the user ID

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
            res.status(444);
            res.send({
              message:'Could not get hostIP and HostPort'
            });
          }
        });
        }
        else {
          res.status(444);
          res.send({
            message:'Server not allocated'
          });
        }
        });
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
  */
})

router.delete('/:username', function (req, res) {
  const sessionId = req.params.sessionId
  const username = decodeURI(req.params.username)

  connection.query(
    'SELECT userID FROM User WHERE username = ?',
    username,
    function (error, results, fields) {
      if (error) {
        res.status(500)
        console.log(
          'An error occured with the MySQL database: ' + error.message
        )
        res.send({
          message: 'Internal error'
        })
      } else if (results.length > 0) {
        connection.query(
          'UPDATE Session SET participantCount = participantCount - 1 WHERE sessionID = ?',
          sessionId,
          function (error, results, fields) {
            if (error) {
              res.status(500)
              console.log(
                'An error occured with the MySQL database: ' + error.message
              )
              res.send({
                message: 'Internal error'
              })
            } else if (results.affectedRows > 0) {
              // leave the server in some way. I already have access to the user ID
              res.status(200)
              res.send({
                message: 'Participant has been removed from the session'
              })
            } else {
              // leave the server in some way. I already have access to the user ID
              res.status(404)
              res.send({
                message: 'User or session does not exist'
              })
            }
          }
        )
      } else {
        res.status(404)
        res.send({
          message: 'User or session does not exist'
        })
      }
    }
  )
})

// export this router to use in our server.js
module.exports = router
