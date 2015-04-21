var Objects = require('../objects');
var mapper = require('../feedback-mapper');
var esprima = require('esprima');
var UglifyJS = require('uglify-js');

//configuration for esprima parsing
var options = {
  tolerant:false,
  loc: true,
  range: true,
  raw: true,
  tokens: true
};

/**
* @function check-syntax(exports)
* @desc validates syntax of JS code
* @param  {Object} submitted - the submitted data, with property code
* @param  {Function} cb - the function(error, result) to call with result
* as param.
**/
module.exports = function(submitted, cb) {
  //parse the code
  var result = parse(submitted.code);
  if (result.err) {
    var err = result.err;
    var feedback = new Objects.Feedback();
    feedback.name = 'ParseError';
    feedback.line = err.lineNumber;
    feedback.column = err.column;
    feedback.addressee = 'student';
    mapper('check-syntax', feedback, function(value) {
      feedback.description = value;
      cb(null, [feedback]);
    });
  } else {
    cb(null, null, {
      ast: result.ast
    });
  }
};

/**
* @function parse
* @desc Tries to parse JS code
* @param {String} code - the JS code to parse
* @return {Object} with property ast if ok, and with err if error.
**/
function parse(code) {
  var result = {};
  try {
    //try to parse with esprima
    var abSynTree = esprima.parse(code, options);
    //try to parse with uglify as well for double check
    var abSynTree2 = UglifyJS.parse(code);
    result.ast = abSynTree2;
  } catch (err) {
    result.err = err;
  } finally {
    return result;
  }
}
