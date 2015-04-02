var Objects = require('../objects');
var mapper = require('../feedback-mapper');

//Variables for parsing:
var esprima = require('esprima');
var UglifyJS = require('uglify-js');

var options = {
  tolerant:false,
  loc: true,
  range: true,
  raw: true,
  tokens: true
};

/*
@function check-syntax(exports)
@desc validates syntax of JS code
@param  {String} data - the JS code to check
@param  {Function} callback - the function(error, result) to call with result as param
*/
module.exports = function(submitted, callback) {
  parse(submitted.code, function(err, tree) {
    if (err) {
      var feedback = new Objects.Feedback();
      feedback.name = 'ParseError';
      feedback.description = err.message;
      feedback.line = err.lineNumber;
      feedback.column = err.column;
      feedback.addressee = 'student';
      mapper('check-syntax', feedback, function(value) {
        feedback.description = value;
        callback(null, [feedback]);
      });
    } else {
      console.log('sucess: Check-syntax');
      callback(null, [], {
        ast: tree
      });
    }
  });
};

/*
@function parse
@desc Tries to parse JS code
@param {String} data - the JS code to parse
@param {Function} callback - the function(error, result) to call with result as param
*/
function parse(code, callback) {
  try {
    var abSynTree = esprima.parse(code, options);
    //try to parse with uglify as well for double check
    var abSynTree2 = UglifyJS.parse(code);
    callback(null, abSynTree2);
  } catch (err) {
    callback(err);
  }
}
