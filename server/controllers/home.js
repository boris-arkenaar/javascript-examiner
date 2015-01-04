/*
 * server/controllers/home.js
 */

'use strict';

var app = require('../app');
var fs = require('fs');
var checkSyntax = require('../lib/check-syntax');
var checkFormat = require('../lib/check-format');
var checkFunctionality = require('../lib/check-functionality');
var solutionFile = 'static/model-solution.js';
var solution;

function index(req, res) {
  res.render('home/index');
}

function express(req, res) {
  fs.readFile(solutionFile, 'utf8', function(err, data) {
    console.log('FILE READ');
    if (err) {
      console.log('FILE READ ERROR', err);
      res.render('home/express', {
        err: 'err'
      });
    } else {
      console.log('FILE READ OK', typeof data);
      var err = false;
      var errors = ['err1', 'err2'];
      checkFormat(data, function(err, errors) {
        console.log('FORMAT CHECKED');
        if (err) {
          console.log('FORMAT CHECKED ERROR', err);
          console.log(err)
        } else {
          console.log('FORMAT CHECKED OK', errors);
          res.render('home/express', {
            hello: 'Hello from express world!',
            errors: errors
          });
        }
      });
    }
  });
}

function fileUpload(req, res, next) {
  var fileLocation = req.files.thumbnail.path;
  checkFunctionality(fileLocation);
  fs.readFile(fileLocation, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    processNext(null, data, res);
  });
}

function processNext(current, data, res) {
  if (!current) {
    //check syntax
    checkSyntax(data, function(err, feedback, ast) {
      if(err) {
        return console.log('error at checkSyntax: ' + err);
      }
      if(feedback) {
        //formatFeedback('syntax', feedback, res);
        sendFeedback(feedback, res);
      } else {
        processNext('syntax', data, res);
      }
    });
  } else if (current === 'syntax') {
    //check format
    checkFormat(data, function(err, feedback) {
      if(err) {
        return console.log('error at checkFormat: ' + err);
      }
      //formatFeedback('format', feedback, res);
      sendFeedback(feedback, res);
    });
  }
}

//format feedback:
function formatFeedback(feedbackType, feedback, res) {
  if(feedbackType === 'syntax') {
    feedback = '<div><textarea cols="100" rows="' + feedback.length + '">' +
    feedback.join('\r\n') + '</textarea></div>';
  } else if (feedbackType === 'format') {
    feedback = '<div><textarea cols="100" rows="' + feedback.length + '">' +
    feedback.join('\r\n') + '</textarea></div>';
  }
  fs.writeFile(FEEDBACKFILENAME, feedback, function(err) {
    if (err) {
    throw err;
    }
    console.log('feedback saved: ' + FEEDBACKFILENAME);
    sendFeedback(res, feedback);
  });
}

//send feedback:
function sendFeedback(feedback, res) {
  res.render('home/feedback', {
    feedback: feedback
  });
}

function page(req, res) {
  res.render('home/page', {
    layout: 'static',
    documentTitle: 'Static Page',
    navTitle: 'Static Layout'
  });
}

function task(req, res, next) {
  app.bbq.create('Test.Add', {
    a: 1,
    b: 2
  }).save(function (err) {
    if (err) { return next(err); }
    res.send('Scheduled task. (`node worker` to process)');
  });
}

// Public API
exports.index = index;
exports.express = express;
exports.fileUpload = fileUpload;
exports.page = page;
exports.task = task;
