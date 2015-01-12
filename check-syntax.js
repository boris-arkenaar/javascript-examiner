var formatter = require('./check-syntax-feedback-formatter');

var outputFileName = __dirname + '\\views\\check-syntax-ast-output.html';
var feedbackFileName = __dirname + '\\views\\check-syntax-feedback.html';

//Variables for parsing:
var esprima = require('esprima');
var abSynTree;
var options = {tolerant:true,
    loc: true,
    range: true,
    raw: true,
    tokens: true,
    comment:true};

/*
@function check-syntax(exports)
@desc validates syntax of JS code
@param  {String} data - the JS code to check
@param  {Function} callback - the function(error, result) to call with result as param
*/
module.exports = function(data, callback) {
  parse(data, function(err, tree) {
    if (err) {
      var feedbackComment = formatter.parseError(err, data).toString();
      var feedback = data.split(/\r?\n/);
      feedback = feedback.slice(0, err.lineNumber).concat(feedbackComment).concat([''])
          .concat(feedback.slice(err.lineNumber));
      callback(null, feedback);
    } else {
      console.log('sucess: Check-syntax');
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
function parse(data, callback) {
  try {
    abSynTree = esprima.parse(data, options);
    callback(null, abSynTree);
  } catch (err) {
    callback(err);
  }
}

