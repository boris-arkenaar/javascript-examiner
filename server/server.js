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
      email: email,
      password: password
    };

    database.getUser(userData, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Incorrect credentials.'
        });
      }
      return done(null, user);
    });
  }
));

var app = express();

app.use(bodyParser.json());

console.log('dirname', __dirname);
app.use(express.static(__dirname + '/../public'));

// TODO: Create a real secret and store it seperatly.
// TODO: Use an other store than the default
//       (https://www.npmjs.com/package/express-session).
//       After that, reconsider the resave option.
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

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

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/secret', loggedIn, function(req, res) {
  res.send('secret');
});

app.post('/check/syntax', getCheckHandler(checkSyntax));
app.post('/check/format', getCheckHandler(checkFormat));
app.post('/check/functionality', getCheckHandler(checkFunctionality));
app.post('/check/maintainability', getCheckHandler(checkMaintainability));

app.get('/exercises', function(req, res) {
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
      //TODO: replace with 503 oid
      res.send(err);
    } else {
      res.send(exercises);
    }
  });
});

app.get('/exercises/:id', function(req, res) {
  var exerciseId = req.params.id;
  database.getExercise(exerciseId, function(err, exercise) {
    if (err) {
      //TODO: replace with 503 oid
      res.send(err);
    } else {
      res.send(exercise);
    }
  });
});

//Depreciated
// app.get('/exercise', function(req, res) {
//   var filter = {
//     chapter: req.query.chapter,
//     number: req.query.number
//   };
//   console.log(filter);
//   database.getExercises(filter, function(err, exercise) {
//     if (err) {
//       //TODO: replace with 503 oid
//       res.send(err);
//     } else {
//       res.send(exercise);
//     }
//   });
// });

var server = app.listen(3030, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example http://%s:%s', host, port);
});

function getCheckHandler(check) {
  return function(request, response) {
    var encoded = request.body.code;
    var buffer = new Buffer(encoded, 'base64');
    var code = buffer.toString();
    var submitted = {
      code: code,
      exerciseId: request.body.exerciseId
    };
    console.log(submitted.exerciseId);
    check(submitted, function(err, feedback, artifacts) {
      var responseData;

      if (err) {
        responseData = err;
      } else {
        responseData = {
          feedback: feedback || [],
          artifacts: artifacts || {}
        };
      }

      response.send(responseData);
    });
  };
}
