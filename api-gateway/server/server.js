'use strict';

/*

    Here we use two middlewares since we receive the following error message
    when the request for the OAuth ID token happens inside "onProxyReq":
    [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client.
    Currently we have not found any alternatives.

*/

const express = require('express');
// Needed to send requests to the
const request = require('request-promise');

// THE FOLLOWING LINE CANNOT BE USED TOGETHER WITH HTTP-PROXY-MIDDLEWARE
// MORE INFO HERE: https://stackoverflow.com/questions/52270848/zero-response-through-http-proxy-middleware
//app.use(express.json()); 

// Set up metadata server request
// See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
const metadataServerTokenURL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=';

const app = express();

app.use('/auth/**', async (req, res, next) => {
    // The full path is retrieved based on the following answer:
    // Link: https://stackoverflow.com/a/10185427
    let fullPath = req.protocol + '://' + req.get('host') + req.originalUrl;
    const tokenRequestOptions = {
        uri: metadataServerTokenURL + fullPath,
        headers: {
            'Metadata-Flavor': 'Google'
        }
    };
    await request(tokenRequestOptions)
    .then((token) => {
        //console.log("Fetched token: " + token);
        //Passing token to the second middleware
        res.locals.token = token;
    })
    .catch((error) => {
        res.status(400).send(error);
    });
    next()
});

var options = {
    target: authApiServiceURL,
    // THE FOLLOWING OPTION NEEDS TO BE HERE EVEN WHEN IT IS UPLOADED TO CLOUD RUN. 
    // IF NOT THE PROXY WON'T WORK PROPERLY!
    changeOrigin: true,
    onError: function(err, req, res) {
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end(
          'The gateway is currently unable to communicated with the requested service.'
        );
    },
    // IMPORTANT! 
    // The onProxyReq must be below the other events (onError and onProxyRes)
    // If not the proxyReq will be undefined and we cannot use the setHeader function
    // The ALTERNATIVE can be used instead
    onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('Authorization','Bearer ' + res.locals.token);
        // ALTERNATIVE:
        //proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
    }
};

var { createProxyMiddleware } = require('http-proxy-middleware');

// LISTENS FOR REQUESTS WITH PATH STARTING WITH /auth
// FOR EXAMPLE auth/login AND auth/register
// ONLY /auth WILL NOT WORK DUE TO "**"
app.use('/auth/**', createProxyMiddleware(options));

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
app.listen(8080);