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
var checkMaintainability =
    require('./check-maintainability/check-maintainability');
var database = require('./database');

var app = express();

app.use(bodyParser.json());

console.log('dirname', __dirname);
app.use(express.static(__dirname + '/../public'));

app.post('/check/syntax', getCheckHandler(checkSyntax));
app.post('/check/format', getCheckHandler(checkFormat));
app.post('/check/functionality', getCheckHandler(checkFunctionality));
app.post('/check/maintainability', getCheckHandler(checkMaintainability));

app.get('/exercises', function(req, res) {
  //get the exercises:
  var filter = {};
  if (req.query.chapter) {
    filter.chapter = req.query.chapter;
  }
  if (req.query.number) {
    filter.number = req.query.number;
  }

  database.getExercises(filter, function(err, exercises) {
    if (err) {
      //TODO: replace with 503 oid
      res.send(err);
    } else {
      res.send(exercises);
    }
  });
});

//Depreciated
// app.get('/exercise', function(req, res) {
//   var filter = {
//     chapter: req.query.chapter,
//     number: req.query.number
//   };
//   console.log(filter);
//   database.getExercises(filter, function(err, exercise) {
//     if (err) {
//       //TODO: replace with 503 oid
//       res.send(err);
//     } else {
//       res.send(exercise);
//     }
//   });
// });

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
    var submitted = {
      code: code,
      exerciseId: request.body.exerciseId
    };
    console.log(submitted.exerciseId);
    check(submitted, function(err, feedback, artifacts) {
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
