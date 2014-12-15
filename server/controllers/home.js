/*
 * server/controllers/home.js
 */

'use strict';

var app = require('../app');



'use strict';
var fs = require('fs');
var checkFormat = require('../lib/check-format');
var solutionFile = 'static/model-solution.js';




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
exports.page = page;
exports.task = task;
