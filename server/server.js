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
var Collections = require('./data/collections');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

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

//User Feedback management
app.post('/user-feedback', function(request, response) {
  var userFeedback = JSON.parse(helper.decode(request.body.data));
  if (request.user) {
    userFeedback.context.userId = request.user._id;
  }
  //1. Email feedback to subscribed users
  Collections.User.find({roles: 'tutor'}, function(err, tutors) {
    //TODO: email subscribed tutors after gh-36 is merged
  });

  //2. Store feedback in Mongo
  userFeedback = new Collections.UserFeedback(userFeedback);
  userFeedback.save(function(err) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.send({saved: true});
    }
  });
});

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
  var user = JSON.parse(helper.decode(req.body.user));
  var userId = user._id;
  var resetPassword = JSON.parse(req.body.resetPassword);
  if (resetPassword) {
    var token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    if (!userId) {
      //new user:
      sendEnrollmentEmail(user.email, token, req.headers.host);
    } else {
      //existing user:
      sendResetPasswordEmail(user.email, token, req.headers.host);
    }
  }
  database.putUser(user, function(err, result) {
    if (err) {
      return response.status(500).end();
    }
    if (!userId && result._id) {
      response.location('/users/' + result._id);
      response.status(201);
    }
    response.send({user: result});
  });
});

function sendEnrollmentEmail(address, token, host) {
  var subject = 'Welcome to javascript-examiner';
  var text = 'http://' + host + '/#/enroll/' + token;
  sendEmail(address,  subject, text);
}

function sendResetPasswordEmail(address, token, host) {
  var subject = 'Password reset';
  var text = 'http://' + host + '/#/reset/' + token;
  sendEmail(address,  subject, text);
}

function sendEmail(address, subject, text) {
  var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'javascript.examiner@gmail.com',
      pass: 's*cr*tP@ssw0rd'
    }
  });
  var mailOptions = {
    to: address,
    from: 'javascript-examiner@gmail.com',
    subject: subject,
    text: text
  };
  smtpTransport.sendMail(mailOptions, function(err, info) {
    console.log(err);
    console.log('Email send', info);
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

app.post('/reset-password', function(req, response) {
  var password = req.body.password;
  delete req.body.password;
  database.getUser(req.body, function(err, user) {
    if (err) {
      response.status(500).send(err);
    } else if (!user) {
      response.status(403).send({message: 'Token not valid for this email'});
    } else {
      user.password = user.generateHash(password);
      user.resetPasswordToken = undefined;
      database.putUser(user, function(err, user) {
        if (err || !user) {
          response.status(500).end(err ||
              {message: 'Something went wrong, try again'});
        } else {
          response.send({sucess: true, message:'Password has been reset'});
        }
      });
    }
  });
});

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
  var user = JSON.parse(helper.decode(req.body.user));
  var userId = user._id;
  var resetPassword = JSON.parse(req.body.resetPassword);
  if (resetPassword) {
    var token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    if (!userId) {
      //new user:
      sendEnrollmentEmail(user.email, token, req.headers.host);
    } else {
      //existing user:
      sendResetPasswordEmail(user.email, token, req.headers.host);
    }
  }
  database.putUser(user, function(err, result) {
    if (!userId && result._id) {
      response.location('/users/' + result._id);
      response.status(201);
    } else {
      response.send({user: result});
    }
  });
});

function sendEnrollmentEmail(address, token, host) {
  var subject = 'Welcome to javascript-examiner';
  var text = 'http://' + host + '/#/enroll/' + token;
  sendEmail(address,  subject, text);
}

function sendResetPasswordEmail(address, token, host) {
  var subject = 'Password reset';
  var text = 'http://' + host + '/#/reset/' + token;
  sendEmail(address,  subject, text);
}

function sendEmail(address, subject, text) {
  var smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'javascript.examiner@gmail.com',
      pass: 's*cr*tP@ssw0rd'
    }
  });
  var mailOptions = {
    to: address,
    from: 'javascript-examiner@gmail.com',
    subject: subject,
    text: text
  };
  smtpTransport.sendMail(mailOptions, function(err, info) {
    console.log(err);
    console.log('Email send', info);
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

app.post('/reset-password', function(req, response) {
  var password = req.body.password;
  delete req.body.password;
  database.getUser(req.body, function(err, user) {
    if (err) {
      response.status(500).send(err);
    } else if (!user) {
      response.status(403).send({message: 'Token not valid for this email'});
    } else {
      user.password = user.generateHash(password);
      user.resetPasswordToken = undefined;
      database.putUser(user, function(err, user) {
        if (err || !user) {
          response.status(500).end(err ||
              {message: 'Something went wrong, try again'});
        } else {
          response.send({sucess: true, message:'Password has been reset'});
        }
      });
    }
  });
});

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
