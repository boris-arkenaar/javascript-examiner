var request = require('supertest');
var app = require('./server').app;
var assert = require('chai').assert;
var _ = require('underscore');

function postExercise(exercise, done, cookie, check) {
      var encoded = new Buffer(JSON.stringify(exercise)).toString('base64');
      request(app)
        .post('/exercise')
        .send({'exercise': encoded})
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        // .expect(check)
        // .expect(200, done);
        .end(function(err, res) {
          check(res);
        });
    }


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
      })
  });
  describe('POST /exercise', function() {
    it('should not be able to save an exercise if not logged in', 
      function(done) {
        var exercise = {
          name: 'testExercise'
        };
        postExercise(exercise, done, null, function(res) {
          console.log('WTF');
          console.log(assert.isTrue(false));
          assert.property(res, 'askie');
          assert.isTrue(false);
        });
        
      }
    )
    // it ('should be able to save an exercise when logged in', function(done) {
    //   var exercise = {
    //     name: 'testExercise'
    //   };
    //   postExercise(exercise, done, function(res) {
    //     assert.property(res.body, 'exercise');
    //     assert.equal(exercise.name, res.body.exercise.name);
    //     assert.property(res.body.exercise, '_id');
    //     exerciseId = res.body.exercise._id;
    //   });
    // });
    // it ('should be able to update an exercise', function(done) {
    //   var exercise = {
    //     _id: exerciseId,
    //     name: 'testExercise_updated',
    //   };
    //   postExercise(exercise, done, cookie, function(res) {
        
    //   });
    // });
  });
  // describe('GET /exercises', function() {
  //   it ('should get at least 1 exercise', function(done) {
  //     request(app)
  //       .get('/exercises')
  //       .set('Accept', 'application/json')
  //       .set('cookie', cookie)
  //       .expect('Content-Type', /json/)
  //       .expect(hasExercises)
  //       .end(done);

  //     function hasExercises(res) {

  //       //check if the added exercise is present
  //       var getExercise = _.find(res.body, function(exercise) {
  //         return exercise._id === exerciseId;
  //       });
  //       assert.isDefined(getExercise);
  //     }
  //   });
  //   it ('should get the added exercise', function(done) {
  //     request(app)
  //       .get('/exercises/' + exerciseId)
  //       .set('cookie', cookie)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(hasExercise)
  //       .expect(200, done);

  //     function hasExercise(res) {
  //       //check if the added exercise is present
  //       assert.equal(exerciseId, res.body._id);
  //     }
  //   });
  // });
  // describe('DELETE /exercise/:id', function(done) {
  //   it ('should delete the added exercise', function(done) {
  //     request(app)
  //       .delete('/exercise/' + exerciseId)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(exerciseRemoved)
  //       .expect(200, done);

  //     function exerciseRemoved(res) {
  //       //assert.property(res.body, 'exercise');
  //       assert.property(res.body, 'removed');
  //       assert.isTrue(res.body.removed);
  //     }
  //   });
  // });
});
