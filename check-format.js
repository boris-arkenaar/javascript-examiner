'use strict';
var Checker = require('jscs');
var loadConfigFile = require('jscs/lib/cli-config');

module.exports = function(code, cb) {
  var checker = new Checker();
  checker.registerDefaultRules();
  checker.configure(loadConfigFile.load('./.jscs.json'));
  var result = [];
  try {
    var errors = checker.checkString(code)
    errors.getErrorList().forEach(function (err) {
      result.push(errors.explainError(err, true));
    });
  } catch (err) {
    cb(err);
  }
 
  
  cb(null, result);
};

