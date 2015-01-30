var express = require('express');
var multer = require('multer');
var clone = require('clone');


var app = express();
app.engine('html', require('ejs').renderFile);
app.use(multer({dest: './tmp/'}));

var fs = require('fs');
var FEEDBACKFILENAME = __dirname + '/views/feedback.html';
var Objects = require('./objects');
var EXECUTION_PLAN =  [ {name: 'syntax', mustPass: true, check: require('./check-syntax')},
                        {name: 'functionality', mustPass: true, check: require('./check-functionality')},
                        {name: 'format', mustPass: false, check: require('./check-format')}
                        //{name: 'semantics', mustPass: false, last: true}
                      ];

function processNext(current, solution, res) {
  if(current < EXECUTION_PLAN.length) {
    //clone solution for integrety:
    var solutionClone = clone(solution);
    //reset feedback:
    solutionClone.feedbackList = [];
    var execution = EXECUTION_PLAN[current];
    execution.check(solutionClone, function(err, thisFeedback, newAttributes) {
      //TODO: Error Handling
      if(err) return console.log(err);
      //If the module added feedback:
        console.log(execution.name);
      if(thisFeedback) {
        console.log(execution.name);
        var feedbackWrapper = { type: execution.name,
                                feedbackList: thisFeedback
                              };
        solution.feedback[solution.feedback.length] = feedbackWrapper;
        if(execution.mustPass) {
          //TODO: Replace with solution.feedback
          formatFeedback(execution.name, solution.feedback, res);
        } else {
          processNext(current+1, solution, res);
        }
      } else {
        processNext(current+1, solution, res);
      }
    });
  } else {
    formatFeedback('format', solution.feedback, res); 
  }
}
//format feedback:
function formatFeedback(feedbackType, feedback, res) {
  // if(feedbackType == 'functionality') {
  //   var feedbackOutput = '<div><textarea cols="100" rows="10">';
  //   feedbackOutput += feedback[0].functionName + 
  //                     ' ' + 
  //                     feedback[0].feedback.name +
  //                     ': ' +
  //                     feedback[0].feedback.message;
  //   feedbackOutput += '</textarea></div>';
  // } else {
  //   var feedbackOutput = '<div><textarea cols="100" rows="' + feedback.length + '">' +
  //   feedback.join('\r\n') + '</textarea></div>';
  // }

  var feedbackOutput = '<div><textarea cols="100" rows="100">';

  feedback.forEach(function(feedbackWrapper) {
    feedbackOutput += feedbackWrapper.type + ': ';
    feedbackWrapper.feedbackList.forEach(function(feedbackInstance) {
      feedbackOutput += '\r\n';
      feedbackOutput += 'Feedbackname: ' +feedbackInstance.name; 
      feedbackOutput += '\r\n';
      feedbackOutput += 'Addressee: ' + feedbackInstance.addressee;  
      feedbackOutput += '\r\n';
      feedbackOutput += 'Description: ' + feedbackInstance.description;  
      feedbackOutput += '\r\n';
      if(feedbackInstance.line) feedbackOutput += 'Line: ' + feedbackInstance.line + '\r\n';
      if(feedbackInstance.column) feedbackOutput += 'Column: ' + feedbackInstance.column + '\r\n';
      feedbackOutput += '-----------------------------------';
      feedbackOutput += '\r\n';
    });
  });

  // var keys = Object.keys(feedback);
  // keys.forEach(function(key) {
  //   feedbackOutput += key;
  //   feedbackOutput += ' ';
  //   feedbackOutput += feedback[key];
  // });

  feedbackOutput += '</textarea></div>';

  
  fs.writeFile(FEEDBACKFILENAME, feedbackOutput, function(err) {
    if (err) {
    throw err;
    }
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
  var solution = new Objects.Solution();
  solution.fileLocation = 'tmp/'+ req.files.thumbnail.name;
  fs.readFile(solution.fileLocation, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    solution.plain = data;
    processNext(0, solution, res);
  });
});

//send form:
app.get('/upload', function (req, res) {
  res.render('form.html');
})

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/rest', express.static(__dirname + '/rest'));
app.use(express.static(__dirname + '/public'));


//run the server
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('JavaScript-Examiner listening at http://%s:%s', host, port)
});

