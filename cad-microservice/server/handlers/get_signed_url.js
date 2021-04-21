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

/*

WE MIGHT NOT NEED TO USE THE KEY FILE SINCE THE MICROSERVICE IS
AUTHORIZED TO ACCESS THE BUCKET.

// Imports the Secret Manager library
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

// Instantiates a client
const client = new SecretManagerServiceClient();

async function getSecret() {
  const [secret] = await client.getSecret({
    name: PROJECT_ID + '/secrets/keyfile-service-account-122919970302-compute-developer-gserviceaccount',
  });
  //const policy = secret.replication.replication;
  console.info(`Found secret ${secret.name} (${policy})`);
  return secret;
}
// [END secretmanager_get_secret]

/* Google Developer Console -> API Manager -> Credentials ->
     Add credentials -> Service account -> JSON -> Create 
*/

//const KEY_FILE = '' // stored on GCP as a secret

// Use route parameters (username and modelname)
router.get('/:username/:modelname', function(req, res){
  // todo test with slash, questionmark, space, etc
  const username = req.params.username;
  const modelName = req.params.modelname
  // POSSIBLY WE DO NOT NEED THIS SINCE WE MIGHT NEED TWO DIFFERENT 
  // ENDPOINTS FOR GENERATING UPLOAD SIGNEDURL AND DOWNLOAD SIGNED URL
  // If the user can download (read) or upload read, write the object stored
  //const accessType = req.body.accesstype;

  // The ID of the GCS file
  const fileName = username + '/' + modelName + '/' + modelName + '.gltf';
  
  // Creates a client
  const storage = new Storage();
    /*{
    projectId: PROJECT_ID,
    keyFilename: KEY_FILE
  });
  */

  async function generatedV4ReadSignedUrl() {

    // Milliseconds 
    const expirationTime = 5 * 60 * 1000; // 5 minutes

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationTime, 
    };
  
    // Get a v4 signed URL for reading the file
    const [signedURL] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options);

    // console.log('The signed url for ${fileName} is ${signedURL}.'); // NEEDS TO BE REMOVED In PRODUCTION!
    // Sending OK response to the client
    // res.status(200); // We don't need this since await storage sends status 200 anyways
    // Sending the signed URL to the client in JSON format
    res.send({
      signedURL: signedURL,
      expirationTime: expirationTime 
    });
  }
  // Responds with status 500 if an error occures with the request to calculate the signed URL
  // The message sent is the error code
  generatedV4ReadSignedUrl().catch(error => {
    res.status(500); 
    res.send({
      message: 'The server failed to generate a signed URL: ' + error.message}
    )}
  );

});

//export this router to use in our server.js
module.exports = router;

