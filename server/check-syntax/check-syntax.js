var Objects = require('../objects');
var mapper = require('../feedback-mapper');
var esprima = require('esprima');
var UglifyJS = require('uglify-js');

/**
 * Configuration for esprima parsing.
 * @type {Object}
 */
var options = {
  tolerant:false,
  loc: true,
  range: true,
  raw: true,
  tokens: true
};

/**
 * Checks the syntax of a solution by parsing the code with esprima.
 *
 * @param {Object} submitted Information of the submitted solution.
 * @param {function} cb
 */
module.exports = function(submitted, cb) {
  var result = parse(submitted.code);
  var feedbackList = [];
  if (result.err) {
    var err = result.err;
    var feedback = new Objects.Feedback();
    feedback.name = 'ParseError';
    feedback.line = err.lineNumber;
    feedback.column = err.column;
    feedback.addressee = 'student';
    feedback.description = err.message;
    feedbackList.push(feedback);
    mapper('check-syntax', feedbackList, function(value) {
      feedbackList = value;
      cb(null, [feedback]);
    });
  } else {
    cb(null, null, {
      ast: result.ast
    });
  }
};

/**
 * Tries to parse JS code using esprima.
 *
 * @param {string} code The JS code to parse.
 * @return {Object} With property ast if ok, and with err if error.
 */
function parse(code) {
  var result = {};
  try {
    // Try to parse with esprima
    var abSynTree = esprima.parse(code, options);
    // Try to parse with uglify as well for double check
    var abSynTree2 = UglifyJS.parse(code);
    result.ast = abSynTree2;
  } catch (err) {
    result.err = err;
  } finally {
    return result;
  }
}
