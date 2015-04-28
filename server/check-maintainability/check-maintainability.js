var esprima = require('esprima');
var escomplex = require('escomplex');
var walker = require('escomplex-ast-moz');
var database = require('../database.js');

var esprimaOptions = {
  tolerant:false,
  loc: true,
  range: true,
  raw: true,
  tokens: true
};

var escomplexOptions = {
};

module.exports = function(submitted, callback) {
  var ast = esprima.parse(submitted.code, esprimaOptions);
  var studentMetrics = escomplex.analyse(ast, walker, escomplexOptions);
  if (submitted.exerciseId) {
    database.getExercise(submitted.exerciseId, function(err, exercise) {
      if (err) {
        callback(err);
      }

      var modelMetrics = null;
      if (exercise && exercise.metrics) {
        modelMetrics = exercise.metrics;
      }

      callback(null, null, combine(modelMetrics, studentMetrics));
    });
  } else {
    callback(null, null, combine(null, studentMetrics));
  }
};

function combine(modelMetrics, studentMetrics) {
  return {
    modelMetrics: modelMetrics,
    studentMetrics: studentMetrics
  };
}
