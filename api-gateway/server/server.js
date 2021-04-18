'use strict';

/*

    Here we use two middlewares since we receive the following error message
    when the request for the OAuth ID token happens inside "onProxyReq":
    [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client.
    Currently we have not found any alternatives.

    UPDATE APRIL 16 2021:
    It might be possible to avoid having two middlewares if we figure out how to
    handle async functions better. There might just be a problem in the way we are thinking.
    We will need to look into this later when if we get time.

    UPDATE APRIL 17 2021:
    The issue of concern was tried to be solved, but it seems that when

*/

const express = require('express');
// Needed to send requests to the
//const request = require('request-promise');
const got = require('got');
const {GoogleAuth} = require('google-auth-library');
const auth = new GoogleAuth();

const authApiServiceURL = process.env.URL_AUTH_MICROSERVICE;
const cadApiServiceURL = process.env.URL_CAD_MICROSERVICE;
const authCheckURL = authApiServiceURL + '/auth/auth_check';
// Set up metadata server request
// See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
//const metadataServerTokenURL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=';

const app = express();

var authOptions = {
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
        proxyReq.setHeader('Authorization', res.locals.authorizationHeader);
        // ALTERNATIVE:
        //proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
    }
};

var cadOptions = {
    target: cadApiServiceURL,
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
        proxyReq.setHeader('Authorization', res.locals.authorizationHeader);
        // ALTERNATIVE:
        //proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
    }
};

/*
var authOptions = {
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
    onProxyReq: async (proxyReq, req, res) => {
        try {
            proxyReq.socket.pause();
            // Create a Google Auth client with the requested service url as the target audience.
            //if (!client) client = await auth.getIdTokenClient(authApiServiceURL + req.originalUrl);
            let client = await auth.getIdTokenClient(authApiServiceURL + req.originalUrl);
            // Fetch the client request headers and add them to the service request headers.
            // The client request headers include an ID token that authenticates the request.
            const clientHeaders = await client.getRequestHeaders();
            proxyReq.setHeader('Authorization', clientHeaders['Authorization']);
            proxyReq.socket.resume();
        } catch (err) {
            // Use response instead
            proxyReq.socket.resume();
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end(
            'Could not create an identity token: ' + err
            );
        }
        //proxyReq.setHeader('Authorization','Bearer ' + id_token);
        // ALTERNATIVE:
        //proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
    }
};
*/

var { createProxyMiddleware } = require('http-proxy-middleware');

// LISTENS FOR REQUESTS WITH PATH STARTING WITH /auth
// FOR EXAMPLE auth/login AND auth/register
// ONLY /auth WILL NOT WORK DUE TO "**"
app.use('/auth/**', getIdToken, createProxyMiddleware(authOptions));
app.use('/cadmodels/**', getIdTokenForAuthCheck, verifyBasicToken, getIdToken, createProxyMiddleware(cadOptions));

// THE FOLLOWING LINE CANNOT BE USED TOGETHER WITH HTTP-PROXY-MIDDLEWARE
// MORE INFO HERE: https://stackoverflow.com/questions/52270848/zero-response-through-http-proxy-middleware
app.use(express.json()); 

async function getIdToken (req, res, next) {
    // The full path is retrieved based on the following answer:
    // Link: https://stackoverflow.com/a/10185427
    try {
        // Get destination url of the request 
        let audience;
        const pathURL = req.originalUrl;
        if (pathURL.startsWith('/auth')) {
            audience = authApiServiceURL + pathURL;
        } else {
            audience = cadApiServiceURL + pathURL;
        }
        /*
        else if (pathURL.startsWith('/cadmodels')){
            audience = cadApiServiceURL + pathURL;
        }
        else {
            throw new Error('Unknown path!');
        }
        */
        console.log(audience);
        // Create a Google Auth client with the requested service url as the target audience.
        const client = await auth.getIdTokenClient(audience);
        // Fetch the client request headers and add them to the service request headers.
        // The client request headers include an ID token that authenticates the request.
        const clientHeaders = await client.getRequestHeaders();
        // Pass the header to the next middleware
        res.locals.authorizationHeader = clientHeaders['Authorization'];
        next();
    } catch (err) {
        // Use response instead
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end(
            'Could not create an identity token: ' + err
        );
    }
};

async function getIdTokenForAuthCheck (req, res, next) {
    // The full path is retrieved based on the following answer:
    // Link: https://stackoverflow.com/a/10185427
    try {
        console.log(JSON.stringify(req.headers));
        // Create a Google Auth client with the requested service url as the target audience.
        const client = await auth.getIdTokenClient(authCheckURL);
        // Fetch the client request headers and add them to the service request headers.
        // The client request headers include an ID token that authenticates the request.
        const clientHeaders = await client.getRequestHeaders();
        console.log(clientHeaders);
        // Pass the header to the next middleware
        res.locals.authorizationHeaderForAuthCheck = clientHeaders['Authorization'];
        next();
    } catch (err) {
        // Use response instead
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        res.end(
            'Could not create an identity token: ' + err
        );
    }
};

async function verifyBasicToken (req, res, next) {
    // The full path is retrieved based on the following answer:
    // Link: https://stackoverflow.com/a/10185427
    try {
        console.log(JSON.stringify(req.headers));
        // The "A" in "Authirization" cannot be captital! It must be lowercased
        const providedToken = req.headers['authorization'].split(' ')[1];//.replace('Basic ','');
        console.log(providedToken);
        var {responseBody} = await got.post(authCheckURL, {
            // Option makes got forward bad requests to the client
            // instead of as exceptions.
            //throwHttpErrors: false,
            headers: { 
                'Authorization': res.locals.authorizationHeaderForAuthCheck
            },
            json: {
                token: providedToken,
                username: 'admin' // TESTING ONLY!
            },
            responseType: 'json'
        });
        console.log('Here!');
        next();
    } catch (err) {
        if (err.name = 'HTTPError') {
            const regExp = /\b\d{3}\b/g;
            const statusCodeExtracted = (err.message).match(regExp)[0];
            console.log(statusCodeExtracted);
            res.writeHead(statusCodeExtracted, {
                'Content-Type': 'application/json'
            });
            res.end(responseBody.data);
        }
        else {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end(
                'Could not verify the basic token: ' + err
            );
        }
    }
};

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
app.listen(8080);


/*
const express = require('express'); 
// Needed to send requests to the
const got = require('got');

// THE FOLLOWING LINE CANNOT BE USED TOGETHER WITH HTTP-PROXY-MIDDLEWARE
// MORE INFO HERE: https://stackoverflow.com/questions/52270848/zero-response-through-http-proxy-middleware
//app.use(express.json()); 

const authApiServiceURL = process.env.URL_AUTH_MICROSERVICE;

// Set up metadata server request
// See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
const metadataServerTokenURL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=';

const app = express();

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
        // The full path is retrieved based on the following answer:
        // Link: https://stackoverflow.com/a/10185427
        (async () => {
            try {
                // Set the options for the request to get the token
                const tokenRequestOptions = {
                    uri: metadataServerTokenURL + authApiServiceURL + req.originalUrl,
                    headers: {
                        'Metadata-Flavor': 'Google'
                    }
                };
                const response = await got(tokenRequestOptions);
            } catch (error) {
                console.log(error.response.body);
                //=> 'Internal server error ...'
            }
        })();
        request()
        .then((token) => {
            //console.log("Fetched token: " + token);
            //Passing token to the second middleware
            return proxyReq.setHeader('Authorization','Bearer ' + token);
        })
        .catch((error) => {
            res.status(400).send(error);
        });
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

*/