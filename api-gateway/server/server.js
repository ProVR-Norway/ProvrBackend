const express = require('express');
const request = require('request-promise');
var session = require('express-session')
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const authApiServiceURL = process.env.URL_AUTH_MICROSERVICE; //https://auth-microservice-s6rss6nenq-lz.a.run.app

// Set up metadata server request
// See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
const metadataServerTokenURL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=';

//var auth_token;

app.post('/auth', async (req, res, next) => {
    console.log("Proxy to fetch token.");
    console.log("First handler body: " + JSON.stringify(req.body));
    console.log("First handler header: " + JSON.stringify(req.headers));
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
        req.setHeader('Authorization', 'Bearer ' + fetched_token);
        console.log("First handler header with authorisation: " + JSON.stringify(req.headers));
    })
    .then((response) => {
        res.status(200).send(response);
    })
    .catch((error) => {
        res.status(400).send(error);
    });
    next()
})

app.post('/auth', createProxyMiddleware({
    target: authApiServiceURL,
    onProxyReq: function (proxyReq, req, res) {
        console.log("onProxyReq.");
        console.log("Second handler body: " + JSON.stringify(req.body));
        console.log("Second handler header: " + JSON.stringify(req.headers));
        console.log("Second handler proxy body: " + JSON.stringify(proxyReq.body));
        console.log("Second handler proxy header: " + JSON.stringify(proxyReq.headers));
        const fetched_token = req.headers['Authorization'];
        console.log("Session token: " + fetched_token);
        proxyReq.setHeader('Authorization', 'Bearer ' + fetched_token);
        //console.log(req.get(headerName));
        console.log("Second handler proxy body: " + JSON.stringify(proxyReq.body));
        console.log("Second handler proxy header: " + JSON.stringify(proxyReq.headers));
        //console.log(auth_token);
        //proxyReq.setHeader('Authorization: ', 'Bearer ' + auth_token);
    }
}));

app.listen(8080);

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