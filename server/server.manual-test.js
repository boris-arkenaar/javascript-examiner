var request = require('supertest');
var app = require('./server').app;
var assert = require('chai').assert;
var _ = require('underscore');

describe('server.js', function() {
  var exerciseId;
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
  describe('GET /users', function() {
    function getUsers(cookie, check) {
      // request(app)
      //   .get('/users')
    }
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
          // console.log(res);
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
          // console.log(res);
          assert.equal(res.status, 403);
          assert.notProperty(res.body, 'exercise');
          done();
        });
      }
    );
    it ('should be able to save an exercise when tutor', function(done) {
      var exercise = {
        name: 'testExercise',
        testSuite: {code: 'console.log(\'this is a test\');'}
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
      var exercise = {
        _id: exerciseId,
        name: 'testExercise_updated',
      };
      postExercise(exercise, tutorCookie, function(res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'exercise');
        assert.equal(exercise.name, res.body.exercise.name);
        assert.property(res.body.exercise, '_id');
        assert.equal(res.body.exercise._id, exercise._id);
        assert.equal(res.body.exercise.name, exercise.name);
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
