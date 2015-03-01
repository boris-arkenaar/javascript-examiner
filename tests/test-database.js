var database = require('../server/database');
var assert = require('assert');

// var exercise = {
// 	id: new Date().toString(),
// 	name: 'An Exercise' 
// };

// database.putExercise(exercise, function(err, res) {
// 	if(err) {
// 		console.log(err);
// 	}
// 		console.log('Exercise:');
// 		console.log(res);
// 		database.getExercises(function(err,res) {
// 			if(err) {
// 				console.log(err);
// 			}
// 				console.log('Exercises:')
// 				console.log(res);
// 				process.exit();
// 		})
// });


describe('Database', function() {
	before(function(done) {
		database.connect('test');
		if(!database.isConnected()) {
			//set timeout to make sure the database is connected
			//if connecting takes more then 1 sec, an error is thrown
			setTimeout(function(){
				if(!database.isConnected()) {
					throw new Error('Can\'t connect to MongoDB');
				} else {
					return done();	
				}
			}, 1000);
		} else {
			done();
		}
	});

	after(function(done) {
		database.disconnect(function(){done();});
	})

	describe('Exports', function(){
		it('should export a getTestSuite function', function() {
			assert.equal('function', typeof database.getTestSuite);
		});
		it('should export a getExercises function', function() {
			assert.equal('function', typeof database.getExercises);
		});
		it('should export a putSolution function', function() {
			assert.equal('function', typeof database.putSolution);
		});
		it('should export a putFeedback function', function() {
			assert.equal('function', typeof database.putFeedback);
		});
		it('should export a putExercise function', function() {
			assert.equal('function', typeof database.putExercise);
		});
		it('should export a isConnected function', function() {
			assert.equal('function', typeof database.isConnected);
		});
	});
	describe('putExercise', function(){
		it('should call callback with an error if there is no param', function(done) {
			database.putExercise(null, function(err) {
				assert.equal(true, err != null);

				if(!err) {
					throw new Error('No error thrown');
				} 
				done();
			})
		})
		it('should throw an error if there is no callback', function(){
			assert.throws(function() {database.putExercise({})}, Error);
			assert.throws(function() {database.putExercise({}, 5)}, Error);
		})
		it('should return the exercise in the callback', function(done){
			var exercise = {name: 'Askie', id: new Date().toString()};
			database.putExercise(exercise, function(err, res) {
				done();
				assert.equal('object', typeof res);
				assert.equal(exercise.name, res.name);
				assert.equal('object', typeof res['_id']);
			});
		})
	});
	describe('getExercises', function(){
		it('should get the exerices currently in the database', function(done) {
			database.getExercises(function(err, res) {
				var count = res.length;
				var exercise = {name: 'Askie', id: new Date().toString()};
				database.putExercise(exercise, function(err, res) {
					database.getExercises(function(err, res2) {
						assert.equal(count + 1, res2.length);
						done();
					});
				});
			});
		})
		it('should throw an error if no callback is passed', function() {
			assert.throws(function() {database.getExercises()}, Error);
			assert.throws(function() {database.getExercises(false)}, Error);
		})
	});
})

