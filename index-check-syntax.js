var fs = require('fs');
var checkSyntax = require('./check-syntax');
var formatter = require('./check-syntax-feedback-formatter');

var outputFileName = __dirname + '\\views\\check-syntax-ast-output.html';
var feedbackFileName = __dirname + '\\views\\check-syntax-feedback.html';

//var solutionPath = __dirname + '\\' + process.argv[2];

module.exports = function(solutionPath, callback) {
  fs.readFile(solutionPath, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    checkSyntax(data, function(err, tree) {
      if (err) {
        var feedbackComment = formatter.parseError(err, data, process.argv[2])
            .toString();
        var feedback = data.split('\r\n');
        feedback = '<div><textarea cols="100" rows="' + feedback.length + '">' + feedback.slice(0, err.lineNumber).concat(feedbackComment).concat([''])
            .concat(feedback.slice(err.lineNumber)).join('\r\n') + '</textarea></div>';
        fs.writeFile(feedbackFileName, feedback, function(err) {
          if (err) {
            throw err;
          }
          console.log('feedback saved: ' + feedbackFileName);
          callback(null, feedbackFileName);
        });
      } else {
        var output = '<div><textarea cols="100" rows="100">' + JSON.stringify(tree, null, 4) + '</textarea></div>';
        //console.log(JSON.stringify(tree, null, 4));
        fs.writeFile(outputFileName, output, function(err) {
          if (err) {
            throw err;
          }
          console.log('log saved: ' + outputFileName);
          callback(null, outputFileName);
        });
        console.log('sucess: Check-syntax');
      }
    });
  });
}
