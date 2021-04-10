const express = require('express');
const request = require('request-promise');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const authApiServiceURL = process.env.URL_AUTH_MICROSERVICE; //https://auth-microservice-s6rss6nenq-lz.a.run.app

// Set up metadata server request
// See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
const metadataServerTokenURL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=';

//var auth_token;

app.use('/auth', async (req, res, next) => {
    console.log("Proxy to fetch token.");
    const tokenRequestOptions = {
        uri: metadataServerTokenURL + authApiServiceURL,
        headers: {
            'Metadata-Flavor': 'Google'
        }
    };
    // Fetch the token, then provide the token in the request to the receiving service
    await request(tokenRequestOptions)
    .then((token) => {
        console.log("Fetched token: " + token);
        req.setHeader('Authorization: ', 'Bearer ' + token);
    })
    .then((response) => {
        res.status(200).send(response);
    })
    .catch((error) => {
        res.status(400).send(error);
    });
    next()
})

app.use('/auth', createProxyMiddleware({
    target: authApiServiceURL,
    onProxyReq: function (proxyReq, req, res) {
        console.log("onProxyReq.");
        //console.log(auth_token);
        //proxyReq.setHeader('Authorization: ', 'Bearer ' + auth_token);
    }
}));

/*
app.use('/login', createProxyMiddleware({
    changeOrigin: true,
    target:'https://auth-microservice-s6rss6nenq-lz.a.run.app'
}));
*/
/*
const http      = require('http');
const httpProxy = require('http-proxy');
//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({
    changeOrigin: true,
    target:'https://auth-microservice-s6rss6nenq-lz.a.run.app'
}).listen(8000); // See (†)
*/

app.listen(8080);