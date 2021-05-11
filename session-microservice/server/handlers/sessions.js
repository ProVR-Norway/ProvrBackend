'use strict';

const express = require('express');
const router = express.Router();

// Used for await/async
const util = require( 'util' );

// Credentials mysql8.0
const MYSQL_HOST = process.env.MYSQL_HOST; // IP of MySQL instance on Google Cloud SQL
const MYSQL_PORT = process.env.MYSQL_PORT;
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
const MYSQL_DATABASE = process.env.MYSQL_DATABASE;


const mysql = require('mysql8.0');

// MySQL config settings
const mysqlConfig = ({
  host     : MYSQL_HOST || 'localhost', 
  port     : MYSQL_PORT || 3306,
  user     : MYSQL_USER || 'root',
  password : MYSQL_PASSWORD || 'password',
  database : MYSQL_DATABASE || 'users'
});

// Connection to the database
const connection = mysql.createConnection( mysqlConfig );

// Alternative database connection
function makeDbConnection( config ) {
  const connection = mysql.createConnection( config );
  // Checks for any errors upon connecting to the server
  connection.connect(function(err){
    if(!err) {
        console.log('Database is connected ...');
    } else {
        console.log('Error when connecting to the MySQL database: ' + err.message);
    }
    });
  return {
    query( sql, args ) {
      return util.promisify( connection.query )
        .call( connection, sql, args );
    },
    close() {
      return util.promisify( connection.end ).call( connection );
    }
  };
}

/*
const getSessionInfoAsJson = async (sessions, arrayToFill) => {
    for (const session of sessions) {
        const serverId = session.serverID;
        const server = await getServerInfo(serverId);
        arrayToFill.push ({
            sessionId: session.sessionID,
            sessionName: session.sessionName,
            mapName: session.mapName,
            maxParticipants: session.maxParticipants,
            participantCount: session.participantCount,
            hostUserId: session.hostUserID,
            hostIP: server.hostIP,
            hostPort: server.hostPort
        });
    }
    return arrayToFill;
}
  
const getServerInfo = (serverIdentifier) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT hostIP, hostPort FROM Server WHERE serverID = ?', serverIdentifier, function (error, results, fields) {
            if (error) {
                reject(error);
            } else { 
                resolve(results[0]);
            }
        });
    });
}
*/

router.get('/', async (req, res) => {

  const username = decodeURI(req.query.username);
  // Initialise the database function
  const db = makeDbConnection(mysqlConfig);

  let userId;
  // Array to be filled with data about all sessions created and invited to
  let sessionsArray = [];

  try {
        // SQL query to retrieve userId
        const retrieveUserID_QueryResults = await db.query('SELECT userID FROM User WHERE username = ?', username);
        // Check if user is found
        if (retrieveUserID_QueryResults.length > 0) {
            userId = retrieveUserID_QueryResults[0].userID;
        }
        else {
            throw new Error(404);
        }
        // SQL query to retrieve sessionID of all sessions that the user has been invited to
        const retrieveSessionIDForSessionsInvitedTo_QueryResults = await db.query('SELECT sessionID FROM Invited_Participant WHERE userID = ?', userId);
        // Check if invited to any sessions
        if (retrieveSessionIDForSessionsInvitedTo_QueryResults.length > 0) {
            for (let i = 0; i < retrieveSessionIDForSessionsInvitedTo_QueryResults.length; i++) {
                const retriveSessionInfo_QueryResults = await db.query('SELECT * FROM Session WHERE sessionID = ?', retrieveSessionIDForSessionsInvitedTo_QueryResults[i].sessionID);
                const serverId = retriveSessionInfo_QueryResults[0].serverID;
                const hostUserId = retriveSessionInfo_QueryResults[0].hostUserID;
                const retrieveServerInfo_QueryResults = await db.query('SELECT hostIP, hostPort FROM Server WHERE serverID = ?', serverId);
                const retirveHostUserName_QueryResults = await db.query('SELECT username FROM User WHERE userID = ?', hostUserId);
                sessionsArray.push ({
                    sessionId: retriveSessionInfo_QueryResults[0].sessionID,
                    sessionName: retriveSessionInfo_QueryResults[0].sessionName,
                    mapName: retriveSessionInfo_QueryResults[0].mapName,
                    maxParticipants: retriveSessionInfo_QueryResults[0].maxParticipants,
                    participantCount: retriveSessionInfo_QueryResults[0].participantCount,
                    hostUsername: retirveHostUserName_QueryResults[0].username,
                    hostIP: retrieveServerInfo_QueryResults[0].hostIP,
                    hostPort: retrieveServerInfo_QueryResults[0].hostPort
                });
            }
        }
        // SQL query to retrive all sessions that the user has created and add them to the array
        const retrieveSessionsWhereUserIsHost_QueryResults = await db.query('SELECT * FROM Session WHERE hostUserID = ?', userId);
        if (retrieveSessionsWhereUserIsHost_QueryResults.length > 0) {
            for (let i = 0; i < retrieveSessionsWhereUserIsHost_QueryResults.length; i++) {
                const serverId = retrieveSessionsWhereUserIsHost_QueryResults[i].serverID;
                const retrieveServerInfo_QueryResults = await db.query('SELECT hostIP, hostPort FROM Server WHERE serverID = ?', serverId);
                sessionsArray.push ({
                    sessionId: retrieveSessionsWhereUserIsHost_QueryResults[i].sessionID,
                    sessionName: retrieveSessionsWhereUserIsHost_QueryResults[i].sessionName,
                    mapName: retrieveSessionsWhereUserIsHost_QueryResults[i].mapName,
                    maxParticipants: retrieveSessionsWhereUserIsHost_QueryResults[i].maxParticipants,
                    participantCount: retrieveSessionsWhereUserIsHost_QueryResults[i].participantCount,
                    hostUsername: username,
                    hostIP: retrieveServerInfo_QueryResults[0].hostIP,
                    hostPort: retrieveServerInfo_QueryResults[0].hostPort
                });
            }
        }
        // Send the result to the client
        res.status(200);
        res.send({
            sessions: sessionsArray
        });
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

  /*
  connection.query('SELECT userID FROM User WHERE username = ?', username, function (error, results, fields) {
    if (error) {
      res.status(500);
      console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
      res.send({
        message:'Internal error'
      });
    } 
    else if (results.length > 0) {
      const userID = results[0].userID;
      connection.query('SELECT * FROM Invited_Participant WHERE userID = ?', userID, function (error, results, fields) {
        if (error) {
          res.status(500);
          console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
          res.send({
            message:'Internal error'
          });
        }
        /*
        else if (results.length > 0) {
          isInvitedToSessions = true;
          console.log('Here!');
          results.forEach(session => {
            const sessionId = session.sessionID;
            connection.query('SELECT serverID FROM Session WHERE sessionID = ?', sessionId, function (error, results, fields) {
              if (error) {
                res.status(500);
                console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
                res.send({
                  message:'Internal error'
                });
              } 
              else {
                const serverId = results[0].serverID;
                connection.query('SELECT hostIP, hostPort FROM Server WHERE serverID = ?', serverId, function (error, results, fields) {
                    if (error) {
                        res.status(500);
                        console.log('An error occured with the MySQL database: ' + error.message);
                        res.send({
                        message:'Internal error'
                        });
                    } else {
                        console.log('Heeere!')
                        sessionList.push ({
                            sessionId: session.sessionID,
                            sessionName: session.sessionName,
                            mapName: session.mapName,
                            maxParticipants: session.maxParticipants,
                            participantCount: session.participantCount,
                            hostUserId: session.hostUserId,
                            hostIP: results[0].hostIP,
                            hostPort: results[0].hostPort
                        });
                    }
                });
              }
            });
          });
        } 
        else {
          connection.query('SELECT * FROM Session WHERE hostUserID = ?', userID, function (error, results, fields) {
            if (error) {
                res.status(500);
                console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
                res.send({
                    message:'Internal error'
                });
            } 
            else if (results.length > 0) {
                example(results, sessionList)
                .then((sessionInfo) => {
                    res.status(200);
                    res.send({
                        sessions: sessionInfo
                    });   
                })
                .catch((error) => {
                    res.status(500);
                    console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
                    res.send({
                        message:'Internal error'
                    });
                });
            }
            else {
                console.log('Here!!')
                if (isInvitedToSessions) {
                    res.status(200);
                    res.send({
                        sessions: sessionList
                    });   
                } else {
                    res.status(404);
                    res.send({
                        message:'User does not exist or no sessions are found'
                    });
                }
            }
          });
        }
      });
    }
    else {
      res.status(404);
      res.send({
        message:'User does not exist or no sessions found'
      });
    }
  });
  */
});

router.post('/', function(req, res){

  const SessionDetails={
    'sessionName': req.body.sessionName,
    'mapName': req.body.mapName,
    'maxParticipants': req.body.maxParticipants,
    'hostUsername': req.body.hostUsername
  };

  console.log(req.body.hostUsername);
  console.log(SessionDetails.hostUsername);

  let errorPostionCount = 0;

  let serverId;
  let hostId;

  connection.query('SELECT userID FROM User WHERE username = ?', SessionDetails.hostUsername, function (error, results, fields) {
    if (error) {
      res.status(500);
      // PRINT OUT THE SPECIFIC ERROR
      console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
      res.send({
          message:'Internal error'
      });
    } 
    else if (results.length > 0) {
        hostId = results[0].userID;
        connection.query('SELECT serverID FROM Server WHERE isAllocated = ?', false, function (error, results, fields) {
          if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
            res.send({
                message:'Internal error'
            });
          } 
          else if (results.length > 0) {
            serverId = results[0].serverID;
            connection.query('SELECT * FROM Session WHERE sessionName = ? AND hostUserID = ?', [SessionDetails.sessionName, hostId], function (error, results, fields) {
              if (error) {
                 res.status(500);
                 // PRINT OUT THE SPECIFIC ERROR
                 console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
                 res.send({
                    message:'Internal error'
                 });
              } 
              else if (results.length > 0) {
                res.status(403);
                res.send({
                  message:'Session with the same name already exists for the user'
                });
              } 
              else {
                connection.query('INSERT INTO Session (sessionName, mapName, maxParticipants, serverID, hostUserID, participantCount) VALUES (?, ?, ?, ?, ?, ?)', [SessionDetails.sessionName, SessionDetails.mapName, SessionDetails.maxParticipants, serverId, hostId, 0], function (error, results, fields) {
                  if (error) {
                    res.status(500);
                    // PRINT OUT THE SPECIFIC ERROR
                    console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
                    res.send({
                        message:'Internal error'
                    });
                  } 
                  else {
                    const sessionId = results.insertId;
                    connection.query('UPDATE Server SET isAllocated = ? WHERE serverID = ?', [true, serverId], function (error, results, fields) {
                      if (error) {
                        res.status(500);
                        // PRINT OUT THE SPECIFIC ERROR
                        console.log('An error occured with the MySQL database: ' + error.message + '. At position ' + (++errorPostionCount));
                        res.send({
                          message:'Internal error'
                        });
                      } 
                      else {
                        res.status(200);
                        res.send({
                            sessionId: sessionId
                        });
                      }
                    });
                  }
                });
              }
            });
          } 
          else {
            res.status(503);
            res.send({
               message:'No servers are currently available'
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

router.delete('/:sessionId', function(req, res){

  const sessionId = req.params.sessionId;

  connection.query('SELECT serverID FROM Session WHERE sessionID = ?', sessionId, function (error, results, fields) {
    if (error) {
      res.status(500);
      // PRINT OUT THE SPECIFIC ERROR
      console.log('An error occured with the MySQL database: ' + error.message);
      res.send({
          message:'Internal error'
      });
    }
    else if (results.length > 0) {
      const serverId = results[0].serverID;
      connection.query('DELETE FROM Invited_Participant WHERE sessionID = ?', sessionId, function (error, results, fields) {
        if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log('An error occured with the MySQL database: ' + error.message);
            res.send({
                message:'Internal error'
            });
        } 
        else {
            connection.query('DELETE FROM Session WHERE sessionID = ?', sessionId, function (error, results, fields) {
                if (error) {
                    res.status(500);
                    // PRINT OUT THE SPECIFIC ERROR
                    console.log('An error occured with the MySQL database: ' + error.message);
                    res.send({
                        message:'Internal error'
                    });
                } 
                else {
                connection.query('UPDATE Server SET isAllocated = ? WHERE serverID = ?', [0, serverId], function (error, results, fields) {
                    if (error) {
                    res.status(500);
                    // PRINT OUT THE SPECIFIC ERROR
                    console.log('An error occured with the MySQL database: ' + error.message);
                    res.send({
                        message:'Internal error'
                    });
                    } else {
                    res.status(200);
                    res.send({
                        message:'Session destroyed successfully'
                    });
                    }
                });
                }
            });
        }
      });
    } else {
      res.status(404);
      res.send({
          message:'Session does not exist'
      });
    }
  });
});

//export this router to use in our server.js
module.exports = router;