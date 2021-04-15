'use strict';

var express = require('express');
var request = require('request-promise');
//var router = express.Router();
//var request = require('request-promise')

//var app = express();
//app.use(express.json()); //THIS CANNOT BE USED TOGETHER WITH HTTP-PROXY-MIDDLEWARE
// MORE INFO HERE: https://stackoverflow.com/questions/52270848/zero-response-through-http-proxy-middleware

const authApiServiceURL = 'https://auth-microservice-development-iu3tuzfidq-ez.a.run.app';//process.env.URL_AUTH_MICROSERVICE;

// Set up metadata server request
// See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
const metadataServerTokenURL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=';

var app = express();


app.use('/auth/**', async (req, res, next) => {
    console.log("Proxy to fetch token.");
    console.log("First handler body: " + JSON.stringify(req.body));
    console.log("First handler header: " + JSON.stringify(req.headers));
    let fullPath = authApiServiceURL + req.originalUrl;
    const tokenRequestOptions = {
        uri: metadataServerTokenURL + fullPath,
        headers: {
            'Metadata-Flavor': 'Google'
        }
    };
    //console.log(authApiServiceURL + req.originalUrl);
    console.log(metadataServerTokenURL + fullPath);
    // Fetch the token, then provide the token in the request to the receiving service
    //res.locals.token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc3NDU3MzIxOGM2ZjZhMmZlNTBlMjlhY2JjNjg2NDMyODYzZmM5YzMiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL2F1dGgtbWljcm9zZXJ2aWNlLWRldmVsb3BtZW50LWl1M3R1emZpZHEtZXouYS5ydW4uYXBwL2F1dGgvbG9naW4iLCJhenAiOiIxMTE0MTk0OTg4MDMzOTQ2NzY2NDUiLCJlbWFpbCI6IjEyMjkxOTk3MDMwMi1jb21wdXRlQGRldmVsb3Blci5nc2VydmljZWFjY291bnQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTYxODQyOTgwMSwiaWF0IjoxNjE4NDI2MjAxLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMTE0MTk0OTg4MDMzOTQ2NzY2NDUifQ.m6lT5W70NRvqG9wzPaPY3nx6sxSEIMRAkQpDqHion3z1BS7MrNOEXXm6hxRQsI3TAmhIzzJ_IVXxoa6FbJLo5aWLLEZhgyIKAO98pjgkwHRU0iTI5xqz-FNeaT8OsY8DvtJDzn6XTKffE7kcf3L_qjmb8g42ZHEgPzF8bf7QHpciPmpkEZDMARNqV1p56_sA2HyDgAFyIcVKRbs3d15gWFmLOfS5lAlp2ueXIq_gg0eQteDtXZ5GlsX21WJzI-uUJy2gIxyW-eBW0UR5XmZ76SycRzVbSiQYjq4n5iVWXZ89RFqgwz75HW3YldoAMIQhthtPwcv9OzIq19MTORTMMQ';
    
    // THIS IS THE CAUSE OF THE PROBLEM!!!
    // Can this be done in a different way to see if the problem is fixed then?
    await request(tokenRequestOptions)
    .then((token) => {
        console.log("Fetched token: " + token);
        res.locals.token = token;
    })
    //.then((response) => {
    //    res.status(200).send(response);
    //})
    .catch((error) => {
        res.status(400).send(error);
    });
    next()
});


var options = {
    target: authApiServiceURL,
    changeOrigin: true, // THIS NEEDS TO BE HERE EVEN WHEN IT IS UPLOADED TO CLOUD RUN. IF NOT IT WONT WORK PROPERLY
    onProxyRes: function(proxyRes, req, res) {
        res.writeHead(proxyRes.statusCode, {
            //proxyRes.headers
            'Content-Type': 'application/json'
        });
        res.end(
            proxyRes.body
        );
    },
    onError: function(err, req, res) {
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end(
          'Something went wrong when communicating with the requested service.'
        );
    },
    // onProxyReq must be below OnProxyRes and OnError!
    onProxyReq: function (proxyReq, req, res) {
        console.log("onProxyReq.");
        console.log(req.body);
        console.log("Second handler header: " + req.headers);
        //const fetched_token = req.headers['Authorization'];
        console.log("Session token: " + res.locals.token);
        //proxyReq.setHeader('Authorization', 'Bearer ' + auth_token);
        //req.headers['Authorization'] = 'Bearer ' + res.locals.token;
        //let token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc3NDU3MzIxOGM2ZjZhMmZlNTBlMjlhY2JjNjg2NDMyODYzZmM5YzMiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJodHRwczovL2F1dGgtbWljcm9zZXJ2aWNlLWRldmVsb3BtZW50LWl1M3R1emZpZHEtZXouYS5ydW4uYXBwL2F1dGgvbG9naW4iLCJhenAiOiIxMTE0MTk0OTg4MDMzOTQ2NzY2NDUiLCJlbWFpbCI6IjEyMjkxOTk3MDMwMi1jb21wdXRlQGRldmVsb3Blci5nc2VydmljZWFjY291bnQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTYxODQyOTgwMSwiaWF0IjoxNjE4NDI2MjAxLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMTE0MTk0OTg4MDMzOTQ2NzY2NDUifQ.m6lT5W70NRvqG9wzPaPY3nx6sxSEIMRAkQpDqHion3z1BS7MrNOEXXm6hxRQsI3TAmhIzzJ_IVXxoa6FbJLo5aWLLEZhgyIKAO98pjgkwHRU0iTI5xqz-FNeaT8OsY8DvtJDzn6XTKffE7kcf3L_qjmb8g42ZHEgPzF8bf7QHpciPmpkEZDMARNqV1p56_sA2HyDgAFyIcVKRbs3d15gWFmLOfS5lAlp2ueXIq_gg0eQteDtXZ5GlsX21WJzI-uUJy2gIxyW-eBW0UR5XmZ76SycRzVbSiQYjq4n5iVWXZ89RFqgwz75HW3YldoAMIQhthtPwcv9OzIq19MTORTMMQ';
        proxyReq.setHeader('Authorization','Bearer ' + res.locals.token);//res.locals.token);
        //proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
        //req.setHeader('Authorization','Bearer ' + res.locals.token);
        //proxyReq.end()
        //proxyReq.headers = req.headers;
        if(req.body) {
            //let bodyData = JSON.stringify(req.body);
            // In case if content-type is application/x-www-form-urlencoded -> we need to change to application/json
            // Stream the content
            
        }
        //proxyReq.body = req.body;
        //proxyReq.headers['Content-Type'] = 'text/plain';
        //proxyReq.headers['Authorization'] = 'Bearer ' + res.locals.token;
        //console.log(req.get(headerName));
        console.log("Second handler proxy body: " + proxyReq.body);
        console.log("Second handler proxy header: " + proxyReq.headers);
        //proxyReq.end();
        //console.log(auth_token);
        //proxyReq.setHeader('Authorization: ', 'Bearer ' + auth_token);
        res.end()
    }
    
};

var { createProxyMiddleware } = require('http-proxy-middleware');

//app.use(express.json());
app.use('/auth/**', createProxyMiddleware(options));

app.listen(8080);

//app.listen(8080);


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