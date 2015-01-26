var assert = require('assert');
var fs = require('fs');
var Objects = require('./objects');
var requireNew = require('require-new');

//replace with database call:
var testFunction = {
	functionName: 'calcBMI',
	check: function(solution) {
		try {
			assert.equal(36, solution.module[this.functionName](150, 80));
		} catch(err) {
			console.log('Generate Feedback:');
			var feedback = new Objects.Feedback();
			feedback.name = 'Test "'+this.functionName+'" failed';
			feedback.description = err.name + ': ' + err.message;
			feedback.addressee = 'student';	
			this.feedback = feedback;
		}
	}
}

//replace with database call;
var exercise = {
	id: 'TestExercise',
	description: 'Dummy Exercise for development',
	testSuite: [testFunction]
};



module.exports = function(solution, callback){
	testFunction.feedback = null;
	//get the exercise:
	//exercise = db.get('exercise', solution.exerciseID);
	//solution.module = require(createModule(solution, exercise, function));

	if(!exercise.testSuite || exercise.testSuite.lenth == 0) {
		var feedback = new Objects.Feedback();
		feedback.name = 'No test suite';
		feedback.check = 'functionality';
		feedback.addressee = 'tutor';
		feedback.description = 'No test suite available for this Exercise';
		callback(null, [feedback]);
	} else {
		//create module
		createModule(solution, exercise, function(feedback) {
			if(feedback) {
				callback(null, feedback);
			} else {
				//test the solution:
				var feedbackList = [];
				exercise.testSuite.forEach(function(test) {
					test.check(solution);
					if(test.feedback) {
						feedbackList[feedbackList.length] = test.feedback;
					}
				});
				solution.module = null;
				if(feedbackList.length > 0) {
					callback(null, feedbackList);
				}	else {
					console.log('success: Check-functionality');
					callback(null, null);	
				}
				
			}
		});
	}
}

function createModule(solution, exercise, callback) {
	//check if all functions are present:
	var moduleContent = solution.plain;
	var feedbackList = [];
	exercise.testSuite.forEach(function(elem) {
		//check if function exists:
		var name = elem.functionName
		if (moduleContent.indexOf('function '+ name) > -1) {
			while(moduleContent.indexOf('function '+ name) > -1) {
				moduleContent = moduleContent.replace('function '+ name, ' exports.' +name + '= function' );
			}
		} else {
			//missing function: add feedback:
			var feedback = new Objects.Feedback();
			feedback.name = 'Function "'+ name +'" not present';
			feedback.check = 'functionality';
			feedback.addressee = 'student';
			feedback.description = 'Unable to find this function in the solution';
			feedbackList[feedbackList.length] = feedback;
		}
	});

	if(feedbackList.length > 0) {
		callback(feedbackList);
	} else {
		solution.moduleFileLocation = solution.fileLocation.replace('.js', '-module.js');
		fs.writeFileSync(solution.moduleFileLocation, moduleContent);
		solution.module = requireNew('./'+solution.moduleFileLocation);
		callback();
	}
}