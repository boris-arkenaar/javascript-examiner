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
exports.getUsers = getUsers;
exports.getExercises = getExercises;
exports.getExercise = getExercise;
exports.getTestSuite = getTestSuite;

function getUsers(filter, callback) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      getUsers(filter, callback);
    });
  }
  Collections.Users.find(filter || {}, function(err, users) {
    if (err) {
      return callback(err);
    }
    callback(null, users);
  });
}

/**
* Get the testSuite corresponding with the exercise
* @param {string} exerciseId the identifier of the exercise
* @param {function} callback with the form callback(err, res)
*/
function getTestSuite(exerciseId, callback) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      getTestSuite(exerciseId, callback);
    });
  }
  getExercise(exerciseId, function(err, exercise) {
    if (err) {
      callback(err);
    } else if (exercise && exercise.testSuite) {
      callback(null, exercise.testSuite);
    } else {
      callback(new Error('Test suite does not exist for id: ' + exerciseId));
    }
  });
}

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

function getExercise(exerciseId, callback) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      getExercise(exerciseId, callback);
    });
  }
  Collections.Exercise.findOne({_id: exerciseId}, function(err, exercise) {
    if (err) {
      callback(err);
    } else if (exercise) {
      callback(null, exercise);
    } else {
      callback(new Error('Exercise does not exist with id: ' + exerciseId));
    }
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
* Insert/Update a user in the database
* @param {Object} user the exercise
* @param {callback} callback the callback with form callback(err, res)
*/
exports.putUser = function(user, callback) {
  if (user === null || (user && typeof user != 'object')) {
    return callback(new Error('A user is required'));
  }
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      putUser(user, callback);
    });
  }
  var dbUser = new Collections.User(user);
  dbUser.save(function(err, dbUser) {
    if (err) {
      return callback(err);
    }
    callback(null, dbUser);
  });
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
  //db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.on('error', function(err) {
    if (connected) {
      callback();
    } else {
      console.error('MongoDB connection error', err);
    }
  });
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
