var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var getRawBody = require('raw-body');
var typer = require('media-typer');
var multer = require('multer');
var Objects = require('./objects');
var helper = require('./helper');
var exercises = require('./exercises');
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
    var code = helper.decode(request.body.code);
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

//Exercise management
app.get('/exercises', loggedIn, exercises.query);
app.get('/exercises/:id', loggedIn, exercises.get);
app.post('/exercises', loggedIn, isTutor, exercises.upsert);
app.delete('/exercises/:id', loggedIn, isTutor, exercises.delete);

//Start server
app.set('port', process.env.PORT || 3030);
var server = app.listen(app.get('port'), function() {
  console.log('App runs at localhost:' + app.get('port'));
  var host = server.address().address;
  var port = server.address().port;
});

// Export required for supertest
module.exports.app = app;
