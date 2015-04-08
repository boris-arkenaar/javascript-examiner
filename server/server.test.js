var request = require('supertest');
var app = require('./server').app;
var assert = require('chai').assert;
var _ = require('underscore');

var exerciseId;

describe('POST /exercise', function() {
  it ('should be able to save an exercise', function(done) {
    var exercise = {
      name: 'testExercise'
    };
    postExercise(exercise, done);
  });
  it ('should be able to update an exercise', function(done) {
    var exercise = {
      _id: exerciseId,
      name: 'testExercise_updated',
    };
    postExercise(exercise, done);
  });
  function postExercise(exercise, done) {
    var encoded = new Buffer(JSON.stringify(exercise)).toString('base64');
    request(app)
      .post('/exercise')
      .send({'exercise': encoded})
      .set('Accept', 'application/json')
      .expect(hasExercise)
      .expect('Content-Type', /json/)
      .expect(200, done);

    function hasExercise(res) {
      assert.property(res.body, 'exercise');
      assert.equal(exercise.name, res.body.exercise.name);
      assert.property(res.body.exercise, '_id');
      exerciseId = res.body.exercise._id;
    }
  }
});
describe('GET /exercises', function() {
  it ('should get at least 1 exercise', function(done) {
    request(app)
      .get('/exercises')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(hasExercises)
      .expect(200, done);

    function hasExercises(res) {
      //check if the added exercise is present
      var getExercise = _.find(res.body, function(exercise) {
        return exercise._id === exerciseId;
      });
      assert.isDefined(getExercise);
    }
  });
  it ('should get the added exercise', function(done) {
    request(app)
      .get('/exercises/' + exerciseId)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(hasExercise)
      .expect(200, done);

    function hasExercise(res) {
      //check if the added exercise is present
      assert.equal(exerciseId, res.body._id);
    }
  });
});
describe('DELETE /exercise/:id', function(done) {
  it ('should delete the added exercise', function(done) {
    request(app)
      .delete('/exercise/' + exerciseId)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(exerciseRemoved)
      .expect(200, done);

    function exerciseRemoved(res) {
      assert.property(res.body, 'exercise');
      assert.property(res.body, 'removed');
      assert.isTrue(res.body.removed);
    }
  });
});
