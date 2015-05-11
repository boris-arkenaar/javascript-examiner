var esprima = require('esprima');
var escomplex = require('escomplex');
var walker = require('escomplex-ast-moz');
var database = require('../database.js');

/**
 * Options for esprima to use when parsing code.
 * @type {Object}
 */
var esprimaOptions = {
  tolerant:false,
  loc: true,
  range: true,
  raw: true,
  tokens: true
};

/**
 * The options to be used by escomplex for analysing the ast.
 * @type {Object}
 */
var escomplexOptions = {
};

/**
 * Checks the maintainability of a solution
 * by running escomplex on the solution code.
 *
 * @param {Object} submitted Information of the submitted solution.
 * @param {function} callback
 */
module.exports = function(submitted, callback) {
  var ast = esprima.parse(submitted.code, esprimaOptions);
  var studentMetrics = escomplex.analyse(ast, walker, escomplexOptions);
  if (submitted.exerciseId) {
    database.getExercise(submitted.exerciseId, function(err, exercise) {
      if (err) {
        callback(err);
      }

      var modelMetrics = null;
      if (exercise && exercise.modelSolution.metrics) {
        modelMetrics = exercise.modelSolution.metrics;
      }
      callback(null, null, combine(modelMetrics, studentMetrics));
    });
  } else {
    callback(null, null, combine(null, studentMetrics));
  }
};

/**
 * Combines the metric results of the student solution and the model solution
 * into one object.
 *
 * @param {Object} modelMetrics The metrics of the model solution.
 * @param {Object} studentMetrics The metrics of the student solution.
 * @return {Object} The combination of the model metrics and the student
 *                  metrics.
 */
function combine(modelMetrics, studentMetrics) {
  return {
    modelMetrics: modelMetrics,
    studentMetrics: studentMetrics
  };
}
