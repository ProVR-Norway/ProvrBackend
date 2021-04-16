//dateformat mysql: '0000-00-00'
// example: 2021-04-16

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
  host     : MYSQL_HOST, 
  port     : MYSQL_PORT,
  user     : MYSQL_USER,
  password : MYSQL_PASSWORD,
  database : MYSQL_DATABASE
});
// Checks for any errors upon connecting to the mysql server
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error when connecting to the MySQL database: " + err.message);
}
});

// Use route parameters (username and modelname)
router.get('/:username', function(req, res){

    const username = req.params.username;
    let userID;

    // Sending a query to the database to find all entries with the same username or email
    connection.query('SELECT userID FROM User WHERE username = ?', username, function (error, results, fields) {
        if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log("An error occured with the MySQL database: " + error.message);
            res.send({
                "failed":"Internal error"
            });
        }
        // If there are any results then we return status code 409
        else if (results.length > 0) {
            userID = results[0].userID;
        } else {
            res.status(403);
            console.log("User does not exist.");
            res.send({
                "failed":"User does not exist."
            });
        }
    });

    // Sending a query to the database to find all entries with the same username or email
    connection.query('SELECT * FROM Model WHERE userID = ?', userID, function (error, results, fields) {
        if (error) {
            res.status(500);
            // PRINT OUT THE SPECIFIC ERROR
            console.log("An error occured with the MySQL database: " + error.message);
            res.send({
                "failed":"Internal error"
            });
        }
        // If there are any results then we return status code 409
        else {
            let owning_models = [];
            // Construct JSON array with every model in it
            results.forEach(model => {
                owning_models.push({
                    modelname: model.name
                    //dateUploaded: model.dateUploaded
                });
            });
            res.status(200);
            res.contentType("application/json");
            res.send(JSON.stringify(owning_models));
        }
    });
    
    
});

//export this router to use in our server.js
module.exports = router;