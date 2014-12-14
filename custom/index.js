'use strict';
var fs = require('fs');
var checkFormat = require('./check-format');
var solutionFile = './model-solution.js';

fs.readFile(solutionFile, 'utf8', function(err, data) {
  if (err) {
    cb(err);
  }
  checkFormat(data, function(err, errors) {
    if (err) {
      console.log(err)
    }
	errors.forEach(function (error) {
      console.log(error);
    });
  });
});

