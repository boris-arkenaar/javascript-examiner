var database = require('./database');
var helper = require('./helper');

//Exercise management

//Get exercise based on filter
exports.query = function(req, res) {
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
      res.status(500).send(err);
    } else {
      res.send(exercises);
    }
  }, req.user.roles);
};

//Get an exercise by id
exports.get = function(req, res) {
  var exerciseId = req.params.id;
  database.getExercise(exerciseId, function(err, exercise) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(exercise);
    }
  }, req.user.roles);
};

//Upsert an exercise
exports.upsert = function(req, response) {
  var exercise = JSON.parse(helper.decode(req.body.exercise));
  var exerciseId = exercise._id;
  var upsertResponse = function(err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      if (!exerciseId && result._id) {
        response.location('/exercises/' + result._id);
        response.status(201);
      }
      //Run functionality test with model solution
      if (result.modelSolution.code.length > 0) {
        checkFunctionality({
          code: result.modelSolution.code,
          exerciseId: result._id
        }, function(err, feedback) {
          response.send({
            exercise: result,
            feedback: {
              testResults: feedback
            }
          });
        });
      } else {
        response.send({
          exercise: result
        });
      }
    }
  };
  var feedback = {};
  var hasFeedback;
  syntaxFormatCheck(exercise.testSuite, function(err, tSFeedback) {
    if (err) {
      return response.status(500).send(err);
    }
    if (tSFeedback) {
      hasFeedback = true;
      feedback.testSuite = tSFeedback;
    }
    syntaxFormatCheck(exercise.modelSolution, function(err, mSFeedback) {
      if (err) {
        return response.status(500).send(err);
      }
      if (mSFeedback) {
        hasFeedback = true;
        feedback.modelSolution = mSFeedback;
      }
      if (hasFeedback) {
        return response.send({feedback: feedback});
      } else {
        database.putExercise(exercise, upsertResponse);
      }
    });
  });
};

//Delete an exercise
exports.delete = function(req, response) {
  var exerciseId = req.params.id;
  if (!exerciseId || exerciseId === 'null') {
    return response.status(403).end();
  }
  database.deleteExercise(exerciseId, function(err, exercise) {
    if (err) {
      response.status(500).send(err);
    } else {
      if (!exercise) {
        return response.status(404).end();
      }
      response.send({exercise: exercise, removed: true});
    }
  });
};

//Checks if syntax or format checks return feedback
function syntaxFormatCheck(submitted, callback) {
  //check syntax
  if (submitted.code && submitted.code !== '') {
    checkSyntax(submitted, function(syntaxErr, syntaxFeedback) {
      //check format
      checkFormat(submitted, function(formatErr, formatFeedback) {
        var feedback;
        if (syntaxFeedback && formatFeedback) {
          feedback = syntaxFeedback.concat(formatFeedback);
        }
        callback(
            syntaxErr ||
            formatErr,
            feedback ||
            syntaxFeedback ||
            formatFeedback
            );
      });
    });
  } else {
    callback();
  }
}
