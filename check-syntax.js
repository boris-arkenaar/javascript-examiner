var fs = require('fs');
var parseSolution = require('./check-syntax-parse');
var formatter = require('./check-syntax-feedback-formatter');

var outputFileName = __dirname + '\\views\\check-syntax-ast-output.html';
var feedbackFileName = __dirname + '\\views\\check-syntax-feedback.html';

//var solutionPath = __dirname + '\\' + process.argv[2];

module.exports = function(data, callback) {
  parseSolution(data, function(err, tree) {
    if (err) {
      var feedbackComment = formatter.parseError(err, data, process.argv[2])
          .toString();
      //var feedback = data.match(/[^\r\n]+/g);
      var feedback = data.split(/\r?\n/);
      //feedback = '<div><textarea cols="100" rows="' + feedback.length + '">' + //feedback.slice(0, err.lineNumber).concat(feedbackComment).concat([''])
      //    .concat(feedback.slice(err.lineNumber)).join('\r\n') + '</textarea></div>';
      feedback = feedback.slice(0, err.lineNumber).concat(feedbackComment).concat([''])
          .concat(feedback.slice(err.lineNumber));
      //fs.writeFile(feedbackFileName, feedback, function(err) {
      //  if (err) {
      //    throw err;
      //  }
      //  console.log('feedback saved: ' + feedbackFileName);
      //  callback(null, feedbackFileName, false);
      //});
      callback(null, feedback);
    } else {
      //var output = '<div><textarea cols="100" rows="100">' + JSON.stringify(tree, null, 4) + '</textarea></div>';
      //console.log(JSON.stringify(tree, null, 4));
      //fs.writeFile(outputFileName, output, function(err) {
      //  if (err) {
      //    throw err;
      //  }
      //  console.log('log saved: ' + outputFileName);
      //  callback(null, outputFileName, true);
      //});
      console.log('sucess: Check-syntax');
      callback(null, null, tree);
    }
  });
}
