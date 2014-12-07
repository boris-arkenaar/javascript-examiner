var fs = require('fs');
var checkSyntax = require('./check-syntax');
var formatter = require('./check-syntax-feedback-formatter');

var outputPath = 'check-syntax-ast-output.log';
var feedbackPath = 'check-syntax-feedback.log';

var solutionPath =__dirname+'\\'+process.argv[2];
fs.readFile(solutionPath, 'utf8', function(err, data) {
	if(err) {
		return console.log(err);
	} 
	checkSyntax(data, function(err, tree) {
		if(err) {
			var feedbackComment = formatter.parseError(err, data, process.argv[2]).toString();
			var feedback = data.split('\r\n');
			feedback = feedback.slice(0, err.lineNumber).concat(feedbackComment).concat(feedback.slice(err.lineNumber)).join('\r\n');
			fs.writeFile(feedbackPath, feedback, function(err) {
				if(err) throw err;
				console.log('feedback saved: '+feedbackPath);
			});
		} else {
			var output = JSON.stringify(tree, null, 4);
			//console.log(JSON.stringify(tree, null, 4));
			fs.writeFile(outputPath, output, function(err) {
				if(err) throw err;
				console.log('log saved: '+outputPath);
			});  
			console.log('sucess: Check-syntax');
		}
	});
});