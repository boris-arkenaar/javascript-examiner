var request = require('supertest');
var app = require('./server').app;
var assert = require('chai').assert;
var _ = require('underscore');

describe('server.js', function() {
  var exerciseId;
  var userId;
  var tutorCookie;
  var studentCookie;
  before(function(done) {
    request(app)
      .post('/login')
      .send({email: 'tutor', password: 'tutor'})
      .expect(200)
      .end(function(err, res) {
        assert.property(res.headers, 'set-cookie');
        tutorCookie = res.headers['set-cookie'];
        request(app)
          .post('/login')
          .send({email: 'student', password: 'student'})
          .expect(200)
          .end(function(err, res) {
            assert.property(res.headers, 'set-cookie');
            studentCookie = res.headers['set-cookie'];
            done();
          });
      });
  });
  describe('POST /user', function() {
    function postUser(user, cookie, check) {
      // var encoded = JSON.stringify(user);
      request(app)
        .post('/users')
        .send({'user': user})
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .end(function(err, res) {
          check(res);
        });
    }
    it('should not be able to save an user if not logged in',
      function(done) {
        var user = {
          email: 'testUser',
        };
        postUser(user, null, function(res) {
          assert.equal(res.status, 401);
          assert.notProperty(res.body, 'user');
          done();
        });
      }
    );
    it('should not be able to save an user if not tutor',
      function(done) {
        var user = {
          name: 'testUser'
        };
        postUser(user, studentCookie, function(res) {
          assert.equal(res.status, 403);
          assert.notProperty(res.body, 'user');
          done();
        });
      }
    );
    it ('should be able to save an user when tutor', function(done) {
      var user = {
        email: 'testUser',
      };
      postUser(user, tutorCookie, function(res) {
        assert.equal(res.status, 201);
        assert.property(res.body, 'user');
        assert.equal(user.name, res.body.user.name);
        assert.property(res.body.user, '_id');
        userId = res.body.user._id;
        assert.equal(res.headers.location, '/users/' + userId);
        done();
      });
    });
    it ('should be able to update an user when tutor', function(done) {
      var user2 = {
        email: 'updatedName',
        _id: userId
      };
      postUser(user2, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'user');
        assert.equal(user2.name, res.body.user.name);
        assert.property(res.body.user, '_id');
        assert.equal(res.body.user._id, user2._id);
        done();
      });
    });
  });
  describe('GET /users', function() {
    function getUsers(userId, cookie, check) {
      var url = '/users';
      if (userId) {
        url += '/' + userId;
      }
      request(app)
        .get(url)
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .end(function(err, res) {
          check(res);
        });
    }
    function hasUsers(res) {
      //check if the added user is present
      var getUser = _.find(res.body, function(user) {
        return user._id === userId;
      });
      assert.isDefined(getUser);
    }
    it ('should not get users when not logged in', function(done) {
      getUsers(null, null, function(res) {
        assert.equal(res.status, 401);
        assert.notProperty(res.body, 'length');
        done();
      });
    });
    it ('should get at least 1 user', function(done) {
      getUsers(null, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        hasUsers(res);
        done();
      });
    });
    it ('should get the added user', function(done) {
      getUsers(userId, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body._id, userId);
        done();
      });
    });
  });
  describe('DELETE /users/:id', function(done) {
    function deleteUser(userId, cookie, check) {
      request(app)
        .delete('/users/' + userId || '')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .end(function(err, res) {
          check(res);
        });
    }
    it ('should not delete if not logged in', function(done) {
      deleteUser(userId, null, function(res) {
        assert.equal(res.status, 401);
        assert.notProperty(res.body, 'removed');
        done();
      });
    });
    it ('should not delete if no userId is provided', function(done) {
      deleteUser(null, tutorCookie, function(res) {
        assert.equal(res.status, 500);
        done();
      });
    });
    it ('should not delete if not tutor', function(done) {
      deleteUser(userId, studentCookie, function(res) {
        assert.equal(res.status, 403);
        done();
      });
    });
    it ('should delete the added user', function(done) {
      deleteUser(userId, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'removed');
        assert.isTrue(res.body.removed);
        done();
      });
    });
    it ('should not delete if provid userId not in db', function(done) {
      deleteUser(userId, tutorCookie, function(res) {
        assert.equal(res.status, 404);
        done();
      });
    });
  });
  describe('POST /exercise', function() {
    function postExercise(exercise, cookie, check) {
      var encoded = new Buffer(JSON.stringify(exercise)).toString('base64');
      request(app)
        .post('/exercises')
        .send({'exercise': encoded})
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .end(function(err, res) {
          check(res);
        });
    }
    it('should not be able to save an exercise if not logged in',
      function(done) {
        var exercise = {
          name: 'testExercise',
        };
        postExercise(exercise, null, function(res) {
          assert.equal(res.status, 401);
          assert.notProperty(res.body, 'exercise');
          done();
        });
      }
    );
    it('should not be able to save an exercise if not tutor',
      function(done) {
        var exercise = {
          name: 'testExercise'
        };
        postExercise(exercise, studentCookie, function(res) {
          assert.equal(res.status, 403);
          assert.notProperty(res.body, 'exercise');
          done();
        });
      }
    );
    it ('should be able to save an exercise when tutor', function(done) {
      var exercise = {
        name: 'testExercise',
        testSuite: {code: 'console.log(\'this is a test\');\n'},
        modelSolution: {code: ''}
      };
      postExercise(exercise, tutorCookie, function(res) {
        assert.equal(res.status, 201);
        assert.property(res.body, 'exercise');
        assert.equal(exercise.name, res.body.exercise.name);
        assert.property(res.body.exercise, '_id');
        exerciseId = res.body.exercise._id;
        assert.equal(res.headers.location, '/exercises/' + exerciseId);
        done();
      });
    });
    it ('should be able to update an exercise when tutor', function(done) {
      var exercise2 = {
        name: 'updatedName',
        _id: exerciseId,
        testSuite: {code: 'console.log(\'this is a test\');\n'},
        modelSolution: {code: ''}
      };
      postExercise(exercise2, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'exercise');
        assert.equal(exercise2.name, res.body.exercise.name);
        assert.property(res.body.exercise, '_id');
        assert.equal(res.body.exercise._id, exercise2._id);
        done();
      });
    });
  });
  describe('GET /exercises', function() {
    function getExercises(exerciseId, cookie, check) {
      var url = '/exercises';
      if (exerciseId) {
        url += '/' + exerciseId;
      }
      request(app)
        .get(url)
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .end(function(err, res) {
          check(res);
        });
    }

    function hasExercises(res) {
      //check if the added exercise is present
      var getExercise = _.find(res.body, function(exercise) {
        return exercise._id === exerciseId;
      });
      assert.isDefined(getExercise);
    }

    it ('should not get exercises when not logged in', function(done) {
      getExercises(null, null, function(res) {
        assert.equal(res.status, 401);
        assert.notProperty(res.body, 'length');
        done();
      });
    });
    it ('should get at least 1 exercise', function(done) {
      getExercises(null, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        hasExercises(res);
        var exposed = _.every(res.body, function(exercise) {
          return (exercise.testSuite);
        });
        assert.isTrue(exposed, 'testSuite not Exposed');
        done();
      });
    });
    it ('should get the added exercise', function(done) {
      getExercises(exerciseId, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body._id, exerciseId);
        assert.property(res.body, 'testSuite');
        done();
      });
    });
    it ('should not expose testSuite to student 1/2', function(done) {
      getExercises(null, studentCookie, function(res) {
        assert.equal(res.status, 200);
        hasExercises(res);
        var exposed = _.every(res.body, function(exercise) {
          return (exercise.testSuite);
        });
        assert.isFalse(exposed, 'testSuite Exposed');
        //assert.notProperty(res.body, 'testSuite');

        done();
      });
    });
    it ('should not expose testSuite to student 2/2', function(done) {
      getExercises(exerciseId, studentCookie, function(res) {
        assert.equal(res.status, 200);
        assert.notProperty(res.body, 'testSuite');
        done();
      });
    });
  });
  describe('DELETE /exercises/:id', function(done) {
    function deleteExercise(exerciseId, cookie, check) {
      request(app)
        .delete('/exercises/' + exerciseId || '')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .end(function(err, res) {
          check(res);
        });
    }
    it ('should not delete if not logged in', function(done) {
      deleteExercise(exerciseId, null, function(res) {
        assert.equal(res.status, 401);
        assert.notProperty(res.body, 'removed');
        done();
      });
    });
    it ('should not delete if no exerciseId is provided', function(done) {
      deleteExercise(null, tutorCookie, function(res) {
        assert.equal(res.status, 403);
        done();
      });
    });
    it ('should not delete if not tutor', function(done) {
      deleteExercise(exerciseId, studentCookie, function(res) {
        assert.equal(res.status, 403);
        done();
      });
    });
    it ('should delete the added exercise', function(done) {
      deleteExercise(exerciseId, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'removed');
        assert.isTrue(res.body.removed);
        done();
      });
    });
    it ('should not delete if provid exerciseId not in db', function(done) {
      deleteExercise(exerciseId, tutorCookie, function(res) {
        assert.equal(res.status, 404);
        done();
      });
    });
  });
});
