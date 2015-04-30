var database = require('../server/database');
var assert = require('chai').assert;
var _ = require('underscore');
describe('Database', function() {
  before(function(done) {
    // process.env.MONGOLAB_URI = 'mongodb://localhost/test';
    database.connect('test', function() {
      done();
    });
  });

  after(function(done) {
    // process.env.MONGOLAB_URI = 'mongodb://localhost/examiner-dev';
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
    it('should export a putExercise function', function() {
      assert.equal('function', typeof database.putExercise);
    });
    it('should export a deleteExercise function', function() {
      assert.equal('function', typeof database.deleteExercise);
    });
    it('should export a putUser function', function() {
      assert.equal('function', typeof database.putUser);
    });
    it('should export a getUser function', function() {
      assert.equal('function', typeof database.getUser);
    });
    it('should export a getUsers function', function() {
      assert.equal('function', typeof database.getUsers);
    });
    it('should export a deleteUser function', function() {
      assert.equal('function', typeof database.deleteUser);
    });
  });
  describe('getUser', function(done) {
    it('should return the user by id', function(done) {
      var user1 = {
        email: 'user1' + Math.random() + '@mail.dot',
        password: 'p@ssword'
      };
      var user2 = {
        email: 'user2' + Math.random() + '@mail.dot',
        password: 'p@ssword'
      };
      database.putUser(user1, function(err, res1) {
        database.putUser(user2, function(err, res2) {
          database.getUser(res1._id, function(err, res3) {
            assert.equal(user1.email, res3.email);
            database.getUser(res2._id, function(err, res4) {
              assert.equal(user2.email, res4.email);
              database.deleteUser(res1._id, function() {
                database.deleteUser(res2._id, done);
              });
            });
          });
        });
      });
    });
  });
  describe('getUsers', function(done) {
    it('should return the users in the database', function(done) {
      var user1 = {
        email: 'user3' + Math.random() + '@mail.dot',
        password: 'p@ssword'
      };
      var user2 = {
        email: 'user4' + Math.random() + '@mail.dot',
        password: 'p@ssword'
      };
      database.putUser(user1, function(err, res1) {
        database.putUser(user2, function(err, res2) {
          database.getUsers(null, function(err, res3) {
            assert.equal(res3.length, 2);
            assert.isDefined(_.find(res3, function(r) {
              return r.email === user1.email;
            }));
            assert.isDefined(_.find(res3, function(r) {
              return r.email === user2.email;
            }));
            database.deleteUser(res1._id, function() {
              database.deleteUser(res2._id, done);
            });
          });
        });
      });
    });
  });
  describe('putUser', function(done) {
    it('should return the user in the callback', function(done) {
      var user = {
        email: 'test5' + Math.random() + '@mail.dot',
        password: 'p@ssword'
      };
      database.putUser(user, function(err, res) {
        assert.equal('object', typeof res);
        assert.equal(user.email, res.email);
        assert.equal('object', typeof res._id);
        assert.notEqual(user.password, res.password);
        database.deleteUser(res._id, done);
      });
    });
    it('should be able to update a user', function(done) {
      var user = {
        email: 'test6' + Math.random() + '@mail.dot',
        password: 'p@ssword'
      };
      database.putUser(user, function(err, res) {
        res.email = 'newEmail@mailNew.com';
        res._id = res._id.toString();
        database.putUser(res, function(err, res2) {
          assert.equal(res2.email, res.email);
          assert.notEqual(res2.email, user.email);
          database.deleteUser(res2._id, done);
        });
      });
    });
  });
  describe('deleteUser', function(done) {
    it('should delete a user', function(done) {
      var user = {
        email: 'test7' + Math.random() + '@mail.dot',
        password: 'p@ssword'
      };
      database.putUser(user, function(err, res) {
        database.deleteUser(res._id, done);
      });
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
        database.deleteExercise(res._id, done);
      });
    });
    it('should be able to update an exercise', function(done) {
      var exercise = {name: 'BaraKi'};
      database.putExercise(exercise, function(err, res) {
        //assert.equal('string', JSON.stringify(err));
        var newName = 'PlusKi';
        res.name = newName;
        var updated = {
          functions: [{name: 'func1', params: []}],
          name: newName,
          ipsum: 'lorem',
          number: 8,
          _id: res._id.toString(),
          testSuite: {
            code: '\n' +
              'var expect = require(\'chai\').expect;\n' +
              '\n' +
              'describe(\'the calcBMI function\', function() {\n' +
              '  it(\'should have been defined\', function() {\n' +
              '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
              '  });\n' +
              '});\n'
          }
        };
        assert.equal('string', typeof res._id.toString());
        res._id = res._id.toString();
        database.getExercises(null, function(err, res2) {
          var count = res2.length;
          database.putExercise(updated, function(err, res3) {
            assert.equal(null, err);
            assert.equal(res3.name, newName);
            //assert.equal(res._id, res3._id);
            assert.equal(typeof res._id, 'object');
            assert.equal(typeof res3._id, 'object');
            assert.equal(String.valueOf(res._id), String.valueOf(res3._id));
            database.getExercises(null, function(err, res4) {
              assert.equal(count, res4.length);
              database.deleteExercise(res._id, done);
            });
          });
        });
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
            database.deleteExercise(res._id, done);
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
      database.putExercise(exercise, function(err, res0) {
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
              database.deleteExercise(res0._id, function() {
                database.deleteExercise(res[0]._id, done);
              });
            });
          });
        });
      });
    });
  });
  describe('deleteExercise', function() {
    it('should delete an exercise', function(done) {
      //Get the current exercises
      database.getExercises(null, function(err, res1) {
        var count = res1.length;
        var exercise = {name: 'Askie', id: new Date().toString()};
        //Add an exercise
        database.putExercise(exercise, function(err, res2) {
          //Check if size has increased by one
          database.getExercises(null, function(err, res3) {
            assert.equal(count + 1, res3.length);
            //Remove the exercise
            database.deleteExercise(res2._id, function(err, res4) {
              //Check if size has decreased by one
              database.getExercises(null, function(err, res5) {
                assert.equal(count, res5.length);
                done();
              });
            });
          });
        });
      });
    });
  });
  describe('putSolution', function() {
    it('should save a solution', function(done) {
      var solution = {
        code: 'Boeja',
        exerciseId: 'dummyId'
      };
      database.putSolution(solution, function(err, res) {
        assert.equal(solution.code, res.code);
        assert.equal(solution.exerciseId, res.exerciseId);
        done();
      });
    });
  });
});
