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

    UPDATE APRIL 19 2021:
    The API Gateway now work as expected after switching from the module 'got' to 'node-fetch'

*/

const express = require('express');
const fetch = require('node-fetch');
const {GoogleAuth} = require('google-auth-library');
const auth = new GoogleAuth();

const authApiServiceURL = process.env.URL_AUTH_MICROSERVICE;
const cadApiServiceURL = process.env.URL_CAD_MICROSERVICE;
const authCheckURL = authApiServiceURL + '/auth/auth_check';

const app = express();

const authOptions = {
    target: authApiServiceURL,
    // THE FOLLOWING OPTION NEEDS TO BE HERE EVEN WHEN IT IS UPLOADED TO CLOUD RUN. 
    // IF NOT THE PROXY WON'T WORK PROPERLY!
    changeOrigin: true,
    onError: function(err, req, res) {
        res.writeHead(500, {
            'Content-Type': 'application/json'
        });
        res.end({
            failed: 'The gateway is currently unable to communicated with the requested service.'
        });
    },
    // IMPORTANT! 
    // The onProxyReq must be below the other events (onError and onProxyRes)
    // If not the proxyReq will be undefined and we cannot use the setHeader function
    // The ALTERNATIVE can be used instead
    onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('Authorization', res.locals.authorizationHeader);
        // ALTERNATIVE:
        // proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
    }
};

var cadOptions = {
    target: cadApiServiceURL,
    // THE FOLLOWING OPTION NEEDS TO BE HERE EVEN WHEN IT IS UPLOADED TO CLOUD RUN. 
    // IF NOT THE PROXY WON'T WORK PROPERLY!
    changeOrigin: true,
    onError: function(err, req, res) {
        res.writeHead(500, {
            'Content-Type': 'application/json'
        });
        res.end({
            failed: 'The gateway is currently unable to communicated with the requested service.'
        });
    },
    // IMPORTANT! 
    // The onProxyReq must be below the other events (onError and onProxyRes)
    // If not the proxyReq will be undefined and we cannot use the setHeader function
    // The ALTERNATIVE can be used instead
    onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader('Authorization', res.locals.authorizationHeader);
        // ALTERNATIVE:
        // proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
    }
};

const { createProxyMiddleware } = require('http-proxy-middleware');

// LISTENS FOR REQUESTS WITH PATH STARTING WITH /auth
// FOR EXAMPLE auth/login AND auth/register
// ONLY /auth WILL NOT WORK DUE TO "**"
app.use('/auth/**', getIdToken, createProxyMiddleware(authOptions));
// LISTENS FOR REQUESTS WITH PATH STARTING WITH /cadmodels
// FOR EXAMPLE cadmodels/listall/{username}
// ONLY /cadmodels WILL NOT WORK DUE TO "**"
app.use('/cadmodels/**', getIdTokenForAuthCheck, verifyBasicToken, getIdToken, createProxyMiddleware(cadOptions));

// THE FOLLOWING LINE MUST BE BELOW THE HTTP-PROXIES!
app.use(express.json()); 

async function getIdToken (req, res, next) {
    try {
        // Get destination url of the request 
        let audience;
        const pathURL = req.originalUrl;
        // Set the audience based on the path of the request sent
        if (pathURL.startsWith('/auth')) {
            audience = authApiServiceURL + pathURL;
        } else {
            audience = cadApiServiceURL + pathURL;
        }
        // Create a Google Auth client with the requested service url as the target audience.
        const client = await auth.getIdTokenClient(audience);
        // Fetch the client request headers and add them to the service request headers.
        // The client request headers include an ID token that authenticates the request.
        const clientHeaders = await client.getRequestHeaders();
        // Pass the header to the retrieved next middleware
        res.locals.authorizationHeader = clientHeaders['Authorization'];
        next();
    } catch (err) {
        res.writeHead(500, {
            'Content-Type': 'application/json'
        });
        res.end({
            failed: 'Could not create an identity token: ' + err
        });
    }
};

async function getIdTokenForAuthCheck (req, res, next) {
    try {
        // Create a Google Auth client with the requested service url as the target audience.
        const client = await auth.getIdTokenClient(authCheckURL);
        // Fetch the client request headers and add them to the service request headers.
        // The client request headers include an ID token that authenticates the request.
        const clientHeaders = await client.getRequestHeaders();
        // Pass the retrieved header to the next middleware
        res.locals.authorizationHeaderForAuthCheck = clientHeaders['Authorization'];
        next();
    } catch (err) {
        res.writeHead(500, {
            'Content-Type': 'application/json'
        });
        res.end({
            failed: 'Could not create an identity token: ' + err
        });
    }
};

async function verifyBasicToken (req, res, next) {
    try {
        // The "A" in "Authirization" cannot be captital! It must be lowercased
        // Extracts the token from 'Basic hdbshbvsjvuweihddsfefwfwfwf'.
        const providedToken = req.headers['authorization'].split(' ')[1];
        const requestBody = JSON.stringify({
            token: providedToken,
            username: req.params.username
        });
        // Sends request to auth_check to check if the token is valid
        const response = await fetch(authCheckURL, {
            method: 'POST',
            body:    requestBody,
            headers: {
                "Content-Type": "application/json",
                'Authorization': res.locals.authorizationHeaderForAuthCheck,
            }
        });
        // If we get a successful response (token is valid)
        // we switch to the next middleware
        if (response.ok) { // res.status >= 200 && res.status < 300
            next();
        // If the response is unsuccessful we exit the middleware chain
        } else {
            // Get the json reponse from auth_check
            // Note: This throws an error if the response is
            // not a JSON object. 
            const data = await response.json();
            // Pass the response from auth_check to the client
            res.status(response.status);
            res.send(data);
        }
    } catch (err) {
        res.writeHead(500, {
            'Content-Type': 'application/json'
        });
        res.end({
            failed: 'Could not verify the basic token: ' + err
        });
    }
};

// THE PORT MUST BE 8080 WHEN UPLODADED TO CLOUD RUN
app.listen(8080);