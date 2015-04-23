var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var getRawBody = require('raw-body');
var typer = require('media-typer');
var multer = require('multer');
var Objects = require('./objects');
var checkSyntax = require('./check-syntax/check-syntax');
var checkFormat = require('./check-format/check-format');
var checkFunctionality = require('./check-functionality/check-functionality');
var checkMaintainability =
    require('./check-maintainability/check-maintainability');
var database = require('./database');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('underscore');
var MongoStore = require('connect-mongo')(session);
var crypto = require('crypto');

//Authentication and Authorization
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  database.getUser({'_id': id}, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    var userData = {
      email: email
    };

    database.getUser(userData, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Unknown user.'
        });
      }
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      return done(null, user);
    });
  }
));

//Configuration routing
var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/../public'));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: database.getConnection()})
}));
app.use(passport.initialize());
app.use(passport.session());

//Handles login attempt
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(info);
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.send(req.user);
    });
  })(req, res, next);
});

//Checks whether requester is logged in.
function loggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect(401, '/#/login');
  }
}

//Checks whether user is tutor
function isTutor(req, res, next) {
  var user = req.user;
  if (user.roles.indexOf('tutor') > -1) {
    next();
  } else {
    res.status(403).end();
  }
}

//Routing to several checks
app.post('/check/syntax', loggedIn,
    getCheckHandler(checkSyntax));
app.post('/check/format', loggedIn,
    getCheckHandler(checkFormat));
app.post('/check/functionality', loggedIn,
    getCheckHandler(checkFunctionality));
app.post('/check/maintainability', loggedIn,
    getCheckHandler(checkMaintainability));

function getCheckHandler(check) {
  return function(request, response) {
    var code = decode(request.body.code);
    var userId = request.user._id;
    var solutionId = request.body.solutionId;
    var exerciseId = request.body.exerciseId;
    var submitted = {
      code: code,
      exerciseId: exerciseId,
      solutionId: solutionId,
      userId: userId
    };
    check(submitted, function(err, feedback, artifacts) {
      if (err) {
        return response.status(500).send(err);
      }

      responseData = {
        feedback: feedback || [],
        artifacts: artifacts || {},
        solutionId: solutionId
      };

      if (!solutionId || solutionId.length === 0) {
        database.putSolution(submitted, function(err, result) {
          if (err) {
            return response.status(500).send(err);
          }

          responseData.solutionId = result._id;
          response.send(responseData);
        });
      } else {
        response.send(responseData);
      }
    });
  };
}

//User management
app.get('/users', loggedIn, isTutor, function(req, response) {
  database.getUsers(null, function(err, users) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send(users);
    }
  });
});

app.get('/users/:id', loggedIn, isTutor, function(req, response) {
  var userId = req.params.id;
  database.getUser({_id: userId}, function(err, user) {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send(user);
    }
  });
});

app.post('/users', loggedIn, isTutor, function(req, response) {
  var user = req.body.user;
  var resetPassword = req.body.resetPassword;
  if (resetPassword) {
    var token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    if (!user._id) {
      //new user:
      sendEnrollmentEmail(user.email, token);
    } else {
      //existing user:
      sendResetPasswordEmail(user.email, token);
    }
  }
  database.putUser(user, function(err, result) {
    if (err) {
      return response.status(500).end();
    }
    if (!user._id && result._id) {
      response.location('/users/' + result._id);
      response.status(201);
    }
    response.send({user: result});
  });
});

function sendEnrollmentEmail(address, token) {
  var subject = 'Welcome to javascript-examiner';
  var text = 'http://' + req.headers.host + '/enroll/' + token;
  sendEmail(address,  subject, text);
}

function sendResetPasswordEmail(address, token) {
  var subject = 'Password reset';
  var text = 'http://' + req.headers.host + '/reset/' + token;
  sendEmail(address,  subject, text);
}

function sendEmail(address, subject, text) {
  var smtpTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
      user: 'javascript-examiner@gmail.com',
      pass: 's*cr*tP@ssw0rd'
    }
  });
  var mailOptions = {
    to: address,
    from: 'javascript-examiner@gmail.com',
    subject: subject,
    text: text
  };
  smtpTransport.sendMail(mailOptions, function(err) {
    console.log('Email send');
  });
}

app.delete('/users/:id', loggedIn, isTutor, function(req, response) {
  var userId = req.params.id;
  if (req.user._id === req.params.id) {
    return response.status(403).end('can\'t delete currently logged in user');
  }
  database.deleteUser(userId, function(err, user) {
    if (err) {
      response.status(500).send(err);
    } else {
      if (!user) {
        return response.status(404).end();
      }
      response.send({user: user, removed: true});
    }
  });
});

//Exercise management
//Delete an exercise
app.delete('/exercises/:id', loggedIn, isTutor, function(req, response) {
  var exerciseId = req.params.id;
  if (!exerciseId || exerciseId === 'null') {
    return response.status(403).end();
  }
  database.deleteExercise(exerciseId, function(err, exercise) {
    if (err) {
      response.status(500).send(err);
    } else {
      if (!exercise) {
        return response.status(404).end();
      }
      response.send({exercise: exercise, removed: true});
    }
  });
});

//Upsert an exercise
app.post('/exercises', loggedIn, isTutor, function(req, response) {
  var exercise = JSON.parse(decode(req.body.exercise));
  var exerciseId = exercise._id;
  var upsertResponse = function(err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      if (!exerciseId && result._id) {
        response.location('/exercises/' + result._id);
        response.status(201);
      }
      //Run functionality test with model solution
      if (result.modelSolution.code.length > 0) {
        checkFunctionality({
          code: result.modelSolution.code,
          exerciseId: result._id
        }, function(err, feedback) {
          response.send({
            exercise: result,
            feedback: {
              testResults: feedback
            }
          });
        });
      } else {
        response.send({
          exercise: result
        });
      }
    }
  };

  var feedback = {};
  var hasFeedback;
  syntaxFormatCheck(exercise.testSuite, function(err, tSFeedback) {
    if (err) {
      return response.status(500).send(err);
    }
    if (tSFeedback) {
      hasFeedback = true;
      feedback.testSuite = tSFeedback;
    }
    syntaxFormatCheck(exercise.modelSolution, function(err, mSFeedback) {
      if (err) {
        return response.status(500).send(err);
      }
      if (mSFeedback) {
        hasFeedback = true;
        feedback.modelSolution = mSFeedback;
      }
      if (hasFeedback) {
        return response.send({feedback: feedback});
      } else {
        console.log(exercise);
        database.putExercise(exercise, upsertResponse);
      }
    });
  });
});

//Checks if syntax or format checks return feedback
function syntaxFormatCheck(submitted, callback) {
  //check syntax
  if (submitted.code && submitted.code !== '') {
    checkSyntax(submitted, function(syntaxErr, syntaxFeedback) {
      //check format
      checkFormat(submitted, function(formatErr, formatFeedback) {
        var feedback;
        if (syntaxFeedback && formatFeedback) {
          feedback = syntaxFeedback.concat(formatFeedback);
        }
        callback(
            syntaxErr ||
            formatErr,
            feedback ||
            syntaxFeedback ||
            formatFeedback
            );
      });
    });
  } else {
    callback();
  }
}

//Get an exercise by id
app.get('/exercises/:id', loggedIn, function(req, res) {
  var exerciseId = req.params.id;
  database.getExercise(exerciseId, function(err, exercise) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(exercise);
    }
  }, req.user.roles);
});

// Get exercise based on filter
app.get('/exercises', loggedIn, function(req, res) {
  //get the exercises:
  var filter = {};
  if (req.query.chapter) {
    filter.chapter = req.query.chapter;
  }
  if (req.query.number) {
    filter.number = req.query.number;
  }

  database.getExercises(filter, function(err, exercises) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(exercises);
    }
  }, req.user.roles);
});

//Start server
var server = app.listen(3030, function() {
  var host = server.address().address;
  var port = server.address().port;
});

//Utility: decode base64
function decode(encoded) {
  return new Buffer(encoded, 'base64').toString();
}

// Export required for supertest
module.exports.app = app;
