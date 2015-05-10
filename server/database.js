var mongoose = require('mongoose');
var mongodbUri = require('mongodb-uri');
var connected = false;
var Collections = require('./data/collections');
var extend = require('extend');

exports.connect = connect;
exports.disconnect = disconnect;

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.putUser = putUser;
exports.getExercises = getExercises;
exports.getExercise = getExercise;
exports.getTestSuite = getTestSuite;
exports.getConnection = getConnection;

/**
 * Returns the connection to the database.
 * Creates a connection if it does not exist.
 *
 * @return {object} The connection object.
 */
function getConnection() {
  if (!connected) {
    connect();
  }
  return mongoose.connection;
}

/**
 * Gets a list of users.
 *
 * @param {Object} filter Filters for retrieving users.
 * @param {function} callback
 */
function getUsers(filter, callback) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      getUsers(filter, callback);
    });
  }
  Collections.User.find(filter || {}, function(err, users) {
    if (err) {
      return callback(err);
    }
    callback(null, users);
  });
}

/**
 * Gets one user by applying the given filters.
 * Does not return any user if more than one user conforms to the given
 * filters.
 *
 * @param {Object} filter Filters for retrieving the user.
 * @param {function} callback
 */
function getUser(filter, callback) {
  getUsers(filter, function(err, users) {
    if (err) {
      callback(err);
    } else if (!users.length || users.length > 1) {
      callback();
    } else {
      callback(null, users[0]);
    }
  });
}

/**
* Updates a user by ID or creates a new user.
*
* @param {Object} user The user data.
* @param {function} callback
*/
function putUser(user, callback) {
  if (user === null || (user && typeof user != 'object')) {
    return callback(new Error('An user is required'));
  }
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      putUser(user, callback);
    });
  }
  //determine if insert or update
  if (user._id) {
    //update
    updateUser(user, callback);
  } else {
    //insert
    insertUser(user, callback);
  }
}

/**
* Creates a new user.
* Generates a hash for (re)setting a password if required.
*
* @param {Object} user The user data.
* @param {function} callback
*/
function insertUser(user, callback) {
  var dbUser = new Collections.User(user);
  if (user.password) {
    dbUser.password = dbUser.generateHash(user.password);
  }
  dbUser.save(function(err, dbUser) {
    if (err) {
      return callback(err);
    }
    callback(null, dbUser);
  });
}

/**
* Updates a user by ID.
* Generates a hash for (re)setting a password if required.
*
* @param {Object} user The user data.
* @param {function} callback
*/
function updateUser(user, callback) {
  findUserById(user._id,
    function(err, dbUser) {
      if (err) {
        return callback(err);
      }
      delete user._id;
      extend(false, dbUser, user);
      dbUser.save(callback);
    }
  );
}

exports.deleteUser = deleteUser;

/**
* Deletes a user by ID.
*
* @param {string} userId The ID of the user to delete.
* @param {function} callback
*/
function deleteUser(userId, callback) {
  findUserById(userId, function(err, old) {
    if (err) {
      callback(err);
    } else {
      if (!old) {
        return callback();
      }
      old.remove(callback);
    }
  });
}

exports.getTestSuite = getTestSuite;
exports.putExercise = putExercise;
exports.deleteExercise = deleteExercise;

/**
* Deletes an exercise by ID.
*
* @param {string} exerciseId The ID of the exercise to delete.
* @param {function} callback
*/
function deleteExercise(exerciseId, callback) {
  findExerciseById(exerciseId, function(err, old) {
    if (err) {
      callback(err);
    } else {
      if (!old) {
        return callback();
      }
      old.remove(callback);
    }
  });
}

/**
* Gets the test suite corresponding with the exercise.
* @param {string} exerciseId the ID of the exercise to get the test suite of.
* @param {function} callback
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

/**
 * Gets a list of exercises.
 *
 * @param {Object} filter Filters for retrieving exercises.
 * @param {function} callback
 * @param {Array.<string>} roles The roles of the current user.
 */
function getExercises(filter, callback, roles) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      getExercises(filter, callback);
    });
  }
  var exclude;
  if (roles && roles.indexOf('tutor') === -1) {
    exclude = '-testSuite';
  }
  Collections.Exercise.find(filter || {}, exclude, function(err, exercises) {
    if (err) {
      return callback(err);
    }
    callback(null, exercises);
  });
}

/**
 * Gets an exercise by ID.
 *
 * @param {number} exerciseId The ID of the exercise to retrieve.
 * @param {function} callback
 * @param {Array.<string>} roles The roles of the current user.
 */
function getExercise(exerciseId, callback, roles) {
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      getExercise(exerciseId, callback);
    });
  }
  var exclude;
  if (roles && roles.indexOf('tutor') === -1) {
    exclude = '-testSuite';
  }

  Collections.Exercise.findOne({_id: exerciseId}, exclude,
    function(err, exercise) {
      if (err) {
        callback(err);
      } else if (exercise) {
        callback(null, exercise);
      } else {
        callback(new Error('Exercise does not exist with id: ' + exerciseId));
      }
    }
  );
}

/**
 * Updates a solution by ID or creates a new solution for an exercise.
 * @param {Object} solution The solution to be saved.
 * @param {function} callback with form callback(err, res, isNew)
 */
exports.putSolution = function(solution, callback) {
  if (solution === null || (solution && typeof solution != 'object')) {
    return callback(new Error('An solution is required'));
  }
  if (!callback || typeof callback != 'function') {
    throw new Error('A callback function is required as second param');
  }
  if (!connected) {
    return connect(null, function() {
      putExercise(solution, callback);
    });
  }
  //insert
  var dbSolution = new Collections.Solution(solution);
  dbSolution.save(function(err, solution) {
    if (err) {
      return callback(err);
    }
    callback(null, dbSolution);
  });
};

/**
 * Creates a new feedback object.
 *
 * @param {Object} solution The related solution.
 * @param {Object} feedback The feedback data.
 * @param {function} callback
 */
exports.putFeedback = function(solution, feedback, callback) {

};

/**
 * Updates an exercise by ID or creates a new exercise.
 * @param {Object} exercise The exercise data.
 * @param {function} callback
 */
function putExercise(exercise, callback) {
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
  //determine if insert or update
  if (exercise._id) {
    //update
    updateExercise(exercise, callback);
  } else {
    //insert
    insertExercise(exercise, callback);
  }
}

/**
 * Creates a new exercise.
 *
 * @param {Object} exercise The exercise data.
 * @param {function} callback
 */
function insertExercise(exercise, callback) {
  var dbExercise = new Collections.Exercise(exercise);
  dbExercise.save(function(err, dbExercise) {
    if (err) {
      return callback(err);
    }
    callback(null, dbExercise);
  });
}

/**
 * Updates an existing exercise by ID.
 *
 * @param {Object} exercise The exercise data.
 * @param {function} callback
 */
function updateExercise(exercise, callback) {
  findExerciseById(exercise._id,
    function(err, old) {
      if (err) {
        callback(err);
      } else {
        //gives error with id so remove it.
        delete exercise._id;
        extend(false, old, exercise);
        old.save(callback);
      }
    }
  );
}

/**
 * Finds an exercise by ID.
 *
 * @param {string} id The ID of the exercise to find.
 * @param {function} callback
 */
function findExerciseById(id, callback) {
  Collections.Exercise.findById(id, callback);
}

/**
 * Finds a user by ID.
 *
 * @param {string} id The ID of the user to find.
 * @param {function} callback
 */
function findUserById(id, callback) {
  Collections.User.findById(id, callback);
}

/**
 * Connects to the database.
 *
 * @param {string} dbName The name of the database to connect to
 *                        ('examiner-dev' by default).
 * @param {function} callback
 */
function connect(dbName, callback) {
  if (connected) {
    return disconnect(function() {
      connect(dbName, callback);
    });
  }
  // Connect to MongoDB:
  // Keep connection alive:
  // based on http://mongoosejs.com/docs/connections.html
  // based on http://tldp.org/HOWTO/TCP-Keepalive-HOWTO/overview.html
  dbName = dbName || 'examiner-dev';
  var uri = process.env.MONGOLAB_URI ||
      'mongodb://localhost/' + dbName;
  var mongooseUri = mongodbUri.formatMongoose(uri);
  var options = {server: {socketOptions:{keepAlive: 1}}};
  mongoose.connect(mongooseUri, options);
  connected = true;
  var db = mongoose.connection;
  db.on('error', function(err) {
    if (connected && callback) {
      connected = false;
      callback(err);
    } else {
      console.error('MongoDB connection error', err);
    }
  });
  db.once('open', function(cb) {
    if (callback) {
      callback();
    }
  });
}

/**
 * Breaks the connection with the database.
 *
 * @param {function} [callback]
 */
function disconnect(callback) {
  mongoose.disconnect();
  connected = false;
  if (callback) {
    callback();
  }
}
