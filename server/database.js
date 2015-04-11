var mongoose = require('mongoose');
var connected = false;
var Collections = require('./data/collections');
var extend = require('extend');

exports.connect = connect;
exports.disconnect = disconnect;
/**
* Get the exercises
* @param {filter} filter , an object with the properties to filter on
* @param {function} callback with form callback(err, res)
*/
exports.getUsers = getUsers;
exports.getUser = getUser;
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
  Collections.User.find(filter || {}, function(err, users) {
    if (err) {
      return callback(err);
    }
    callback(null, users);
  });
}

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
* Get the testSuite corresponding with the exercise
* @param {string} exerciseId the identifier of the exercise
* @param {function} callback with the form callback(err, res)
*/
exports.getTestSuite = getTestSuite;
/**
* Insert/Update an exercise in the database
* @param {Object} exercise the exercise
* @param {callback} callback the callback with form callback(err, res)
*/
exports.putExercise = putExercise;
/**
* Delete an exercise from the database
* @param {String} exerciseId the Id of the exercise
* @param {callback} callback the callback with form callback(err, res)
*/
exports.deleteExercise = deleteExercise;

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
  dbUser.password = dbUser.generateHash(user.password);

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

function insertExercise(exercise, callback) {
  var dbExercise = new Collections.Exercise(exercise);
  dbExercise.save(function(err, dbExercise) {
    if (err) {
      return callback(err);
    }
    callback(null, dbExercise);
  });
}

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

function findExerciseById(id, callback) {
  Collections.Exercise.findById(id, callback);
}

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
