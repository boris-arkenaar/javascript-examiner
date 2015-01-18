var express = require('express');
var multer = require('multer');
var app = express();
app.engine('html', require('ejs').renderFile);
app.use(multer({dest: './tmp/'}));

var fs = require('fs');
var FEEDBACKFILENAME = __dirname + '/views/feedback.html';
var Solution = require('./solution');
var EXECUTION_PLAN =  [ {name: 'syntax', mustPass: true, check: require('./check-syntax')},
                        {name: 'functionality', mustPass: true, check: require('./check-functionality')},
                        {name: 'format', mustPass: false, check: require('./check-format')}
                        //{name: 'semantics', mustPass: false, last: true}
                      ];

function processNext(current, solution, res) {
  if(current < EXECUTION_PLAN.length) {
    var execution = EXECUTION_PLAN[current];
    console.log(execution);
    console.log(execution.check);
    //TODO: replace with solution:
    execution.check(solution, function(err, feedback) {
      //TODO: Error Handling
      if(err) console.log(err);
      if(feedback) {
        solution.feedback[execution.name] = feedback
        if(execution.mustPass) {
          //TODO: Replace with solution.feedback
          formatFeedback(execution.name, feedback, res);
        } else {
          processNext(current+1, solution, res);
        }
      } else {
        processNext(current+1, solution, res);
      }
    });
  } else {
    //TODO: Replace with solution.feedback
    formatFeedback('format', solution.feedback.format, res); 
  }
}
//format feedback:
function formatFeedback(feedbackType, feedback, res) {
  if(feedbackType == 'functionality') {
    var feedbackOutput = '<div><textarea cols="100" rows="10">';
    feedbackOutput += feedback[0].functionName + 
                      ' ' + 
                      feedback[0].feedback.name +
                      ': ' +
                      feedback[0].feedback.message;
    feedbackOutput += '</textarea></div>';
  } else {
    var feedbackOutput = '<div><textarea cols="100" rows="' + feedback.length + '">' +
    feedback.join('\r\n') + '</textarea></div>';
  }

  
  fs.writeFile(FEEDBACKFILENAME, feedbackOutput, function(err) {
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
  var solution = new Solution();
  solution.fileLocation = __dirname + '/tmp/'+ req.files.thumbnail.name;
  fs.readFile(solution.fileLocation, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    solution.plain = data;
    processNext(0, solution, res);
  });
});

//run the server
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('JavaScript-Examiner listening at http://%s:%s', host, port)
})

//send form:
app.get('/', function (req, res) {
  res.render('form.html');
})