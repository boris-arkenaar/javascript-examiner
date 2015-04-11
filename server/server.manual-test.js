var request = require('supertest');
var app = require('./server').app;
var assert = require('chai').assert;
var _ = require('underscore');

describe('server.js', function() {
  var exerciseId;
  var cookie;
  before(function(done) {
    request(app)
      .post('/login')
      .send({email: 'test', password: 'test'})
      .expect(200)
      .end(function(err, res) {
        assert.property(res.headers, 'set-cookie');
        cookie = res.headers['set-cookie'];
        done();
      });
  });
  describe('POST /exercise', function() {

    function postExercise(exercise, cookie, check) {
      var encoded = new Buffer(JSON.stringify(exercise)).toString('base64');
      request(app)
        .post('/exercise')
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
          name: 'testExercise'
        };
        postExercise(exercise, null, function(res) {
          // console.log(res);
          assert.equal(res.status, 401);
          assert.notProperty(res.body, 'exercise');
          done();
        });
      }
    );
    it ('should be able to save an exercise when logged in', function(done) {
      var exercise = {
        name: 'testExercise'
      };
      postExercise(exercise, cookie, function(res) {
        assert.property(res.body, 'exercise');
        assert.equal(exercise.name, res.body.exercise.name);
        assert.property(res.body.exercise, '_id');
        exerciseId = res.body.exercise._id;
        done();
      });
    });
    it ('should be able to update an exercise', function(done) {
      var exercise = {
        _id: exerciseId,
        name: 'testExercise_updated',
      };
      postExercise(exercise, cookie, function(res) {
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
      getExercises(null, cookie, function(res) {
        hasExercises(res);
        done();
      });
    });
    it ('should get the added exercise', function(done) {
      getExercises(exerciseId, cookie, function(res) {
        assert.isObject(res.body);
        assert.equal(res.body._id, exerciseId);
        done();
      });
    });
  });
  describe('DELETE /exercise/:id', function(done) {
    function deleteExercise(exerciseId, cookie, check) {
      request(app)
        .delete('/exercise/' + exerciseId || '')
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
      deleteExercise(null, cookie, function(res) {
        assert.equal(res.status, 403);
        done();
      });
    });
    it ('should delete the added exercise', function(done) {
      deleteExercise(exerciseId, cookie, function(res) {
        assert.property(res.body, 'removed');
        assert.isTrue(res.body.removed);
        done();
      });
    });
    it ('should not delete if provid exerciseId not in db', function(done) {
      deleteExercise(exerciseId, cookie, function(res) {
        assert.equal(res.status, 404);
        done();
      });
    });
  });
});
