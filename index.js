const awsContext = require('aws-lambda-mock-context');
const alexaVerifier = require('alexa-verifier');
const bodyParser = require('body-parser');
const express = require('express');
const https = require('https');
const http = require('http');
const actions = require('./actions');
const alexa = require('./alexa');
const query = require('./query');


// Global variables
const E = process.env;
const X = express();


X.use(bodyParser.json());
X.use(bodyParser.urlencoded({extended: true}));
X.use('/actions', actions);
X.all('/alexa', (req, res) => {
  var h = req.headers;
  alexaVerifier(h.signaturecertchainurl, h.signature, JSON.stringify(req.body), (err) => {
    if(err) return res.status(400).send();
    var ctx = awsContext();
    alexa.handler(req.body, ctx);
    ctx.Promise.then((ans) => res.json(ans));
  });
});
X.all('/', (req, res) => res.redirect(`https://skillf.github.io/extra-audio`));


var server = http.createServer(X);
server.listen(E.PORT||80, () => {
  var addr = server.address();
  console.log(`SERVER: listening on ${addr.port}`);
});
