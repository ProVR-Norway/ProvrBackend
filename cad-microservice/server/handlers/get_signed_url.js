const express = require('express');
const router = express.Router();

router.get('/', function(req, res){

  // The ID of your GCS bucket
  const bucketName = 'your-unique-bucket-name';

  // The ID of the GCS file
  const fileName = 'your-file-name';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  // Signed URL
  var signedURL;

  async function generateSignedUrl() {
    // These options will allow temporary read access to the file
    const options = {
      version: 'v2', // defaults to 'v2' if missing.
      action: 'read',
      expires: Date.now() + 1000 * 60 * 5, // 5 minutes
    };

    // Get a v2 signed URL for the file
    [signedURL] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options);

    console.log(`The signed url for ${fileName} is ${signedURL}.`);
  }

  generateSignedUrl().catch(console.error);

  res.send(signedURL);

});


