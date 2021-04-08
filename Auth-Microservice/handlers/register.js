var express = require('express');
var router = express.Router();

// MySQL
var mysql = require('mysql8.0');
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '49160',
  user     : 'user',
  password : 'password',
  database : 'users'
});
connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error when connecting to the MySQL database.");
}
});

/*
router.get('/', function(req, res){
   res.json({ message: 'welcome to our upload module apis' });
});
*/

router.post('/', function(req, res){

   var users={
      "username":req.body.username,
      "userEmail":req.body.emailAddress,
      "password":req.body.password
   }
   
   connection.query('INSERT INTO User SET ?', users, function (error, results, fields) {
     if (error) {
       res.send({
         "code":400,
         "failed":"An error occured with the MySQL database"
       })
     } else {
       res.send({
         "code":200,
         "success":"User registered sucessfully"
           });
       }
   });
});
/*
router.post('/', function(req, res){
      const password = Object.keys(req)[2];
      //const encryptedPassword = bcrypt.hash(password, saltRounds)

      var users={
         "username":Object.keys(req)[0],
         "userEmail":Object.keys(req)[1],
         "password":password
      }
      
      connection.query('INSERT INTO User SET ?', users, function (error, results, fields) {
        if (error) {
          res.send({
            "code":400,
            "failed":"error ocurred"
          })
        } else {
          res.send({
            "code":200,
            "success":"user registered sucessfully"
              });
          }
      });
   });
*/
//export this router to use in our index.js
module.exports = router;