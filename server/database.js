var mongoose = require('mongoose');
var connected = false;
var Collections = require('./data/collections');

exports.connect = connect;
exports.disconnect = disconnect;

/**
* Get the exercises
* @param {filter} filter , an object with the properties to filter on
* @param {function} callback with form callback(err, res)
*/
exports.getExercises = getExercises;

/**
* Get the testSuite corresponding with the exercise
* @param {string} exerciseId the identifier of the exercise
* @param {function} callback with the form callback(err, res)
*/
exports.getTestSuite = function(exerciseId, callback) {

};

function getExercises(filter, callback) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      getExercises(filter, callback);
    });
  }
  Collections.Exercise.find(filter || {}, function(err, exercises) {
    if (err) {
      return callback(err);
    }
    callback(null, exercises);
  });
}

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
  if (exercise === null || (exercise && typeof exercise != 'object')) {
    return callback(new Error('An exercise is required'));
  }
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      putExercise(exercise, callback);
    });
  }
  var dbExercise = new Collections.Exercise(exercise);
  dbExercise.save(function(err, dbExercise) {
    if (err) {
      return callback(err);
    }
    callback(null, dbExercise);
  });
};

function connect(dbName, callback) {
  if (connected) {
    return disconnect(function() {
      connect(dbName, callback);
    });
  }
  //Connect to MongoDB:
  //Keep connection alive:
  //based on http://mongoosejs.com/docs/connections.html
  //based on http://tldp.org/HOWTO/TCP-Keepalive-HOWTO/overview.html
  var link = (dbName) ? 'mongodb://localhost/' + dbName :
      'mongodb://localhost/examiner-dev';
  mongoose.connect(link,
    {server: {socketOptions:{keepAlive: 1}}});
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', function(cb) {
    connected = true;
    callback();
  });
}

//Helper to disconnect from MongoDB
function disconnect(callback) {
  mongoose.disconnect();
  connected = false;
  if (callback) {
    callback();
  }
}
