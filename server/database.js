var mongoose = require('mongoose');
var connected = false;

/**
* Get the testSuite corresponding with the exercise
* @param {string} exerciseId the identifier of the exercise
* @param {function} callback with the form callback(err, res)
*/
exports.getTestSuite = function(exerciseId, callback) {

};

/**
* Get the exercises
* @param {function} callback with form callback(err, res)
*/
exports.getExercises = function(callback) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as first param');
  }
  ExerciseM.find(function(err, exercises) {
    if (err) {
      return callback(err);
    }
    callback(null, exercises);
  });
};

/**
* Insert/Update the solution in the database
* @param {Object} solution the solution to be saved
* @param {callback} callback with form callback(err, res, isNew)
*/
exports.putSolution = function(solution, callback) {

};

/**
* Insert the feedback in the database
* @param {Object} solution the related solution
* @param {Object} feedback the feedback
* @param {callback} callback the callback with form callback(err, res)
*/
exports.putFeedback = function(solution, feedback, callback) {

};

/**
* Insert/Update an exercise in the database
* @param {Object} exercise the exercise
* @param {callback} callback the callback with form callback(err, res)
*/
exports.putExercise = function(exercise, callback) {
  if (exercise == null || (exercise && typeof exercise != 'object')) {
    return callback(new Error('An exercise is required'));
  }
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  var dbExercise = new ExerciseM(exercise);
  dbExercise.save(function(err, dbExercise) {
    if (err) {
      return callback(err);
    }
    callback(null, dbExercise);
  });
}

exports.isConnected = function() {
  return connected;
}

exports.connect = function(db) {
  mongoose.connect('mongodb://localhost/' + db || 'examiner-dev',
    {server: {socketOptions:{keepAlive: 1}}});
  var db = mongoose.connection;
  //Connect to MongoDB:
  //Keep connection alive:
  //based on http://mongoosejs.com/docs/connections.html
  //based on http://tldp.org/HOWTO/TCP-Keepalive-HOWTO/overview.html
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', function(callback) {
    console.log('Connected!');
    connected = true;
  });
}

exports.disconnect = function(callback) {
  mongoose.disconnect();
  callback();
}

//for developing only:
exports.drop = function(name) {

}

var exerciseSchema = mongoose.Schema({
  id: String,
  //number: String,
  //description: String,
  name: String
});
var ExerciseM = mongoose.model('Exercise', exerciseSchema);
