var Checker = require('jscs');
var loadConfigFile = require('jscs/lib/cli-config');
var Objects = require('../objects');
var mapper = require('../feedback-mapper');

/**
* @function check-syntax(exports)
* @desc validates format of JS code
* @param  {Object} submitted - the submitted data, with property code
* @param  {Function} cb - the function(error, result) to call with result
* as param.
**/
module.exports = function(submitted, cb) {
  //configure checker
  var checker = new Checker();
  checker.registerDefaultRules();
  checker.configure(loadConfigFile.load(__dirname + '/jscs-config.json'));
  var feedbackList = [];
  try {
    var errors = checker.checkString(submitted.code);
    //loop over errors
    errors.getErrorList().forEach(function(err) {
      var feedback = new Objects.Feedback();
      feedback.addressee = 'student';
      feedback.name = err.rule;
      feedback.description = err.message;
      feedback.line = err.line;
      feedback.column = err.column;
      //This should be fixed, see comment #14
      //mapper('check-syntax', feedback, function(value) {
        // feedback.description = value;
      feedbackList.push(feedback);
      //});
    });
  } catch (err) {
    cb(err);
  }
  feedbackList = (feedbackList.length > 0) ? feedbackList : null;
  cb(null, feedbackList);
};
