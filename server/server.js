var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var getRawBody = require('raw-body');
var typer = require('media-typer');
var multer = require('multer');
var Objects = require('./objects');
var checkSyntax = require('./check-syntax/check-syntax');
var checkFormat = require('./check-format/check-format');
var checkFunctionality = require('./check-functionality/check-functionality');

var app = express();

app.use(bodyParser.json());

console.log('dirname', __dirname);
app.use(express.static(__dirname + '/../public'));

app.post('/check/syntax', getCheckHandler(checkSyntax));
app.post('/check/format', getCheckHandler(checkFormat));
app.post('/check/functionality', getCheckHandler(checkFunctionality));

var server = app.listen(3030, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example http://%s:%s', host, port);
});

function getCheckHandler(check) {
  return function(request, response) {
    var encoded = request.body.code;
    var buffer = new Buffer(encoded, 'base64');
    var code = buffer.toString();

    check(code, function(err, feedback, artifacts) {
      var responseData;

      if (err) {
        responseData = err;
      } else {
        responseData = {
          feedback: feedback || [],
          artifacts: artifacts || {}
        };
      }

      response.send(responseData);
    });
  };
}

