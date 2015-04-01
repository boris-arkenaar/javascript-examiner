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

app.delete('/exercise/:id', function(req, response) {
  var exerciseId = req.params.id;
  database.deleteExercise(exerciseId, function(err, exercise) {
    if (err) {
      //TODO: replace with 503 oid
      response.send(err);
    } else {
      response.send({exercise: exercise, removed: true});
    }
  });
});

app.post('/exercise', function(req, response) {
  console.log('Geroepen');
  var exercise = JSON.parse(decode(req.body.exercise));
  console.log(exercise);
  var upsertResponse = function(err, result) {
    if (err) {
      console.log('Geroepen5');
      console.log(err);
      response.send(err);
    } else {
      console.log('Geroepen6');
      response.send({exercise: result});
    }
  };

  if (exercise.testSuite.code && exercise.testSuite.code !== '') {
    console.log('Geroepen2');
    //Check if syntax test suite is ok
    checkSyntax({code: exercise.testSuite.code}, function(err, feedback) {
      if (err) {
        console.log('Geroepen3');
        return response.send(err);
      }
      if (feedback && feedback.length > 0) {
        console.log('Geroepen4');
        console.log(feedback);
        return response.send({feedback: feedback});
      }
      database.putExercise(exercise, upsertResponse);
    });
  } else {
    database.putExercise(exercise, upsertResponse);
  }
});

app.get('/exercises/:id', function(req, res) {
  var exerciseId = req.params.id;
  database.getExercise(exerciseId, function(err, exercise) {
    if (err) {
      //TODO: replace with 503 oid
      res.send(err);
    } else {
      res.send(exercise);
    }
  });
});

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
    var code = decode(request.body.code);
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

function decode(encoded) {
  return new Buffer(encoded, 'base64').toString();
}
