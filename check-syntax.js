var formatter = require('./check-syntax-feedback-formatter');

var outputFileName = __dirname + '\\views\\check-syntax-ast-output.html';
var feedbackFileName = __dirname + '\\views\\check-syntax-feedback.html';

//Variables for parsing:
var esprima = require('esprima');
var abSynTree;
var options = {tolerant:false,
    loc: true,
    range: true,
    raw: true,
    tokens: true};

/*
@function check-syntax(exports)
@desc validates syntax of JS code
@param  {String} data - the JS code to check
@param  {Function} callback - the function(error, result) to call with result as param
*/
module.exports = function(solution, callback) {
  parse(solution.plain, function(err, tree) {
    if (err) {
      console.log('no sucess:', err);
      var feedbackComment = formatter.parseError(err, solution.plain).toString();
      var feedback = solution.plain.split(/\r?\n/);
      feedback = feedback.slice(0, err.lineNumber).concat(feedbackComment).concat([''])
          .concat(feedback.slice(err.lineNumber));
      callback(null, feedback);
    } else {
      console.log('sucess: Check-syntax');
      console.log(tree);
      callback(null, null, tree);
    }
  });
}

/*
@function parse
@desc Tries to parse JS code
@param {String} data - the JS code to parse
@param {Function} callback - the function(error, result) to call with result as param
*/
function parse(solution, callback) {
  try {
    abSynTree = esprima.parse(solution.plain);
    callback(null, abSynTree);
  } catch (err) {
    callback(err);
  }
}

