var checker = require('./check-functionality');
var fs = require('fs');
var syntax = require('./check-syntax');
var Solution = require("./solution");

//get the test solution
var solution = new Solution();
solution.fileLocation = process.argv[2];

fs.readFile(process.argv[2], 'utf8',  function(err, data) {
	if(err) return console.log('Error:', err);
	solution.plain = data;
	//createModule();
	//console.log(solution.tree);
	checker(solution, callback);
});

var callback = function(err, feedback) {
	console.log('Feedback Geroepen');
	console.log(feedback);
};