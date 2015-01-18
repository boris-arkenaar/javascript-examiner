var assert = require('assert');
var fs = require('fs');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

//replace with database call:
var testFunction1 = {
	functionName: 'calcBMI',
	check: function(solution) {
		try {
			assert.equal(10, solution.module[this.functionName](150, 80));
		} catch(err) {
			this.feedback = err;
		}
	}
}

//replace with database call;
var exercise = {
	id: 'TestExercise',
	description: 'Dummy Exercise for development',
	testSuite: [testFunction1]
};

module.exports = function(solution, callback){
	console.log('geroepen');
	//create module
	solution.module = require(createModule(solution));
	//console.log(solution);
	//get the exercise:
	//exercise = db.get('exercise', solution.exerciseID);
	var feedback = []
	exercise.testSuite.forEach(function(test) {
			test.check(solution);
			if(test.feedback) {
				feedback[feedback.length] = test;
			}
	});
	if(feedback.length > 0) {
		console.log(feedback);


		callback(null, feedback);	
	} else {
		callback(null, null);
	}	
}

function createModule(solution) {
	var ast = jsp.parse(solution.plain);
	var moduleContent = pro.gen_code(ast);
	ast[1].forEach(function(elem) {
		if(elem[0] === 'defun') {
			solution.functions[solution.functions.length] = elem[0];
			//console.log('magic1000:', moduleContent.indexOf('function ' + elem[1]));
			moduleContent = moduleContent.replace('function '+ elem[1], ' exports.' +elem[1] + '= function' );		
		}
	});
	console.log(moduleContent);
	solution.moduleFileLocation = solution.fileLocation.replace('.js', '-module.js');
	fs.writeFileSync(solution.moduleFileLocation, moduleContent);
	return solution.moduleFileLocation;
}