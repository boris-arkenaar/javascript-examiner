var Objects = require('../objects');

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
module.exports = function(solution, callback) {
  parse(solution, function(err, tree) {
    if (err) {
      var feedback = new Objects.Feedback();
      feedback.name = 'ParseError';
      feedback.description = err.message;
      feedback.line = err.lineNumber;
      feedback.column = err.column;
      feedback.addressee = 'student';
      callback(null, [feedback]);
    } else {
      console.log('sucess: Check-syntax');
      solution.abstractSyntaxTree = tree;
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
function parse(solution, callback) {
  try {
    var abSynTree = esprima.parse(solution, options);
    //try to parse with uglify as well for double check
    var abSynTree2 = UglifyJS.parse(solution);
    callback(null, abSynTree2);
  } catch (err) {
    callback(err);
  }
}
