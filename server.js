var express = require('express');
var multer = require('multer');
var app = express();
app.engine('html', require('ejs').renderFile);
app.use(multer({dest: './tmp/'}));
var checkSyntax = require('./check-syntax');
var checkFormat = require('./check-format');
var fs = require('fs');
var solution;

var FEEDBACKFILENAME = __dirname + '\\views\\feedback.html';

function processNext(current, data, res) {
  if(!current) {
    //check syntax
    checkSyntax(data, function(err, feedback, ast) {
      if(err) {
        return console.log('error at checkSyntax: ' + err);
      }
      if(feedback) {
        formatFeedback('syntax', feedback, res);
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
      formatFeedback('format', feedback, res);
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
    sendFeedback(res);
  });
}

//send feedback:
function sendFeedback(res) {
  res.render(FEEDBACKFILENAME);
}

//process submitted solution:
app.post('/file-upload', function (req, res, next) {
  //load the file:
  var fileLocation = __dirname + '\\tmp\\'+ req.files.thumbnail.name;
  fs.readFile(fileLocation, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    processNext(null, data, res);
  });
});

//run the server
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})

//send form:
app.get('/', function (req, res) {
  res.render('form.html');
})