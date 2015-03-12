var database = require('../server/database');
var assert = require('assert');

// var exercise = {
//  id: new Date().toString(),
//  name: 'An Exercise'
// };

// database.putExercise(exercise, function(err, res) {
//  if(err) {
//    console.log(err);
//  }
//    console.log('Exercise:');
//    console.log(res);
//    database.getExercises(null, function(err,res) {
//      if(err) {
//        console.log(err);
//      }
//        console.log('Exercises:')
//        console.log(res);
//        process.exit();
//    })
// });

describe('Database', function() {
  before(function(done) {
    database.connect('test', function() {
      done();
    });
  });

  after(function(done) {
    database.disconnect(function() { done();});
  });

  describe('Exports', function() {
    it('should export a connect function', function() {
      assert.equal('function', typeof database.connect);
    });
    it('should export a disconnect function', function() {
      assert.equal('function', typeof database.disconnect);
    });
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
  });
  describe('putExercise', function() {
    it('should call callback with an error if there is no param',
        function(done) {
      database.putExercise(null, function(err) {
        assert.equal(true, err !== null);

        if (!err) {
          throw new Error('No error thrown');
        }
        done();
      });
    });
    it('should throw an error if there is no callback', function() {
      assert.throws(function() {database.putExercise({});}, Error);
      assert.throws(function() {database.putExercise({}, 5);}, Error);
    });
    it('should return the exercise in the callback', function(done) {
      var exercise = {name: 'Askie', id: new Date().toString()};
      database.putExercise(exercise, function(err, res) {
        assert.equal('object', typeof res);
        assert.equal(exercise.name, res.name);
        assert.equal('object', typeof res._id);
        done();
      });
    });
  });
  describe('getExercises', function() {
    it('should get the exerices currently in the database', function(done) {
      database.getExercises(null, function(err, res) {
        var count = res.length;
        var exercise = {name: 'Askie', id: new Date().toString()};
        database.putExercise(exercise, function(err, res) {
          database.getExercises(null, function(err, res2) {
            assert.equal(count + 1, res2.length);
            done();
          });
        });
      });
    });
    it('should throw an error if no callback is passed', function() {
      assert.throws(function() {database.getExercises(null);}, Error);
      assert.throws(function() {database.getExercises(null, false);}, Error);
    });
    it('should get a particular exercise if a filter is applied',
        function(done) {
      var exercise = {name: new Date().toString() + Math.random()};
      database.putExercise(exercise, function(err, res) {
        if (err) {
          throw err;
        }
        var exercise2 = {name: new Date().toString() + Math.random()};
        database.putExercise(exercise2, function(err, res) {
          if (err) {
            throw err;
          }
          database.getExercises({name: exercise.name}, function(err, res) {
            if (err) {
              throw err;
            }
            assert.equal(res.length, 1);
            assert.equal(res[0].name, exercise.name);
            database.getExercises({name: exercise2.name}, function(err, res) {
              if (err) {
                throw err;
              }
              assert.equal(res.length, 1);
              assert.equal(res[0].name, exercise2.name);
              done();
            });
          });
        });
      });
    });
  });
});
