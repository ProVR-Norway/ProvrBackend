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
    host     : MYSQL_HOST || 'localhost', 
    port     : MYSQL_PORT || 3306,
    user     : MYSQL_USER || 'root',
    password : MYSQL_PASSWORD || 'password',
    database : MYSQL_DATABASE || 'users'
});
// Checks for any errors upon connecting to the mysql server
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error when connecting to the MySQL database: " + err.message);
}
});

// SINCE THE QUERIES ARE DEPENDANT AND ASYNCHRONUS WE NEED TO NEST THEM. AWAIT COULD ALSO HAVE BEEN USED
// LINK: https://stackoverflow.com/questions/53649272/how-to-use-result-array-of-a-query-in-another-query-in-mysqlnode-js
// Use query parameter (username in this case).
router.get('/', function(req, res){

    const username = req.query.username;

    // Sending a query to the database to find the user id of the person with this username
    connection.query('SELECT userID FROM User WHERE username = ?', username, function (error, results, fields) {
        if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log("An error occured with the MySQL database: " + error.message);
            res.send({
                message:"Internal error"
            });
        }
        // If we get a result we send a new query to get the owning models of that person
        else if (results.length > 0) {
            const userId = results[0].userID;
            // IMPORTANT! We use the userID as foreign key to ensure scalability (if we later want the user to be able to change username)
            //  AND dateUploaded IS NOT NULL
            connection.query('SELECT * FROM Model WHERE userID = ?', userId, function (error, results, fields) {
                if (error) {
                    res.status(500);
                    // PRINT OUT THE SPECIFIC ERROR
                    console.log("An error occured with the MySQL database: " + error.message);
                    res.send({
                        message:"Internal error"
                    });
                }
                // Regardless of if the user has any models or not we send an array to the client (empty if no models are uploaded)
                else {
                    let owning_models = [];
                    // Construct JSON array with every model in it
                    results.forEach(model => {
                        owning_models.push({
                            modelName: model.name,
                            dateUploaded: model.dateUploaded
                        });
                    });
                    res.status(200);
                    res.send({
                        models: owning_models
                    });
                }
            });
        // If we find no matching username, we return the 403 status code
        } else {
            res.status(404);
            console.log("User does not exist");
            res.send({
                message:"User does not exist"
            });
        }
    });
});

//export this router to use in our server.js
module.exports = router;