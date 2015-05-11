var Checker = require('jscs');
var loadConfigFile = require('jscs/lib/cli-config');
var Objects = require('../objects');
var mapper = require('../feedback-mapper');

/**
 * Checks the format of a solution by runnig jscs.
 *
 * @param {Object} submitted Information of the submitted solution.
 * @param {function} cb
 */
module.exports = function(submitted, cb) {
  // Configure checker
  var checker = new Checker();
  checker.registerDefaultRules();
  checker.configure(loadConfigFile.load(__dirname + '/jscs-config.json'));
  var feedbackList = [];
  var returnList = [];
  try {
    var errors = checker.checkString(submitted.code);
    // Loop over errors
    errors.getErrorList().forEach(function(err) {
      var feedback = new Objects.Feedback();
      feedback.addressee = 'student';
      feedback.name = err.rule;
      feedback.description = err.message;
      feedback.line = err.line;
      feedback.column = err.column;
      feedbackList.push(feedback);
    });
    mapper('check-format', feedbackList, function(value) {
      returnList = (value.length > 0) ? value : null;
      cb(null, returnList);
    });
  } catch (err) {
    cb(err);
  }
};
