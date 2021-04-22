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
} else {
    console.log("Error when connecting to the MySQL database: " + err.message);
}
});

router.post('/', function(req, res){

    const notificationData={
        'eventType': req.body.message.attributes['eventType'],
        'objectId': req.body.message.attributes['objectId'],
        'eventTime': req.body.message.attributes['eventTime']
    }
    /******************************************************************
    **************** PRINT REQUEST TO CONSOLE ************************
   */
    console.log("HTTP header of request to " + req.originalUrl + ": " + JSON.stringify(req.headers));
    console.log("HTTP body of request to " + req.originalUrl + ": "  + JSON.stringify(req.body));
   /************** END PRINT REQUEST TO CONSOLE **********************
    ******************************************************************
   */

    // If the notification is about a file being uploaded
    if (notificationData.eventType === 'OBJECT_FINALIZE') {
        
        const objectIdSplit = notificationData.objectId.split('/');
        const modelName = objectIdSplit[1];
        const uploadDate = notificationData.eventTime.substring(0, 11);

        connection.query('UPDATE Model SET dateUploaded = ? WHERE modelName = ?', [uploadDate, modelName], function (error, results, fields) {
            if (error) {
                res.status(500);
                // PRINT OUT THE SPECIFIC ERROR
                console.log("An error occured with the MySQL database: " + error.message);
                res.send({
                    message:"Internal error"
                });
            }
        });
    }

    res.status(200).send();

});

//export this router to use in our server.js
module.exports = router;