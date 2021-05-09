'use strict';

const express = require('express');
const router = express.Router();

/**
 *  IMPORTANT! For the handler below to be able to generate a signed URL the service account of the
 *  Cloud Run instance needs the have the role "Service Account Token Creator".
 */

// The ID of your GCS bucket
const bucketName = process.env.USER_MODELS_BUCKET_NAME; // stored in GitHub secrets

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Use route parameters (username and modelname)
router.get('/', function(req, res){
  // TODO: test with slash, questionmark, space, etc
  // RESULT: Slash cannot be used, but all the others works fine.
  // The reason is that we split by slash in the pub/sub endpoint
  
  const username = decodeURI(req.query.username);
  const modelFile = decodeURI(req.query.modelfile);
  const action = req.query.action;
  
  // Remove file extension
  const modelName = modelFile.replace(/\.[^/.]+$/, '');

  // The ID of the GCS file
  const fileName = username + '/' + modelName + '/' + modelFile;
  
  // Creates a client
  const storage = new Storage();

  if (action === 'read') {
    async function generatedV4ReadSignedUrl() {

      // Milliseconds 
      const expirationTime = 5 * 60 * 1000; // 5 minutes
    
      const options = {
        version: 'v4',
        action: action,
        expires: Date.now() + expirationTime, 
      };
    
      // Get a v4 signed URL for reading the file
      const [signedURL] = await storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl(options);
    
      // Sending the signed URL to the client in JSON format
      res.send({
        signedURL: signedURL,
        expirationTime: expirationTime 
      });
    };
    generatedV4ReadSignedUrl()
    .catch(error => {
      // Responds with status 500 if an error occures with the request to calculate the signed URL
      // The message sent is the error code
      res.status(500); 
      res.send({
        message: 'The server failed to generate a signed URL: ' + error.message
      });
    });
  }
  else if (action === 'write') {
    async function generatedV4WriteSignedUrl() {

      // Milliseconds 
      const expirationTime = 5 * 60 * 1000; // 5 minutes
    
      const options = {
        version: 'v4',
        action: action,
        expires: Date.now() + expirationTime, 
        contentType: 'application/octet-stream',
      };
    
      // Get a v4 signed URL for reading the file
      const [signedURL] = await storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl(options);
        
      res.send({
        signedURL: signedURL,
        expirationTime: expirationTime 
      });
    };
    generatedV4WriteSignedUrl()
    .catch(error => {
      // Responds with status 500 if an error occures with the request to calculate the signed URL
      // The message sent is the error code
      res.status(500); 
      res.send({
        message: 'The server failed to generate a signed URL: ' + error.message
      });
    });
  } else {
    res.status(400); 
    res.send({
      message: 'Unknown action type'
    });
  }
});


//export this router to use in our server.js
module.exports = router;

