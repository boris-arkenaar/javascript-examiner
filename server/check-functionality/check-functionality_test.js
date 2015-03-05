var checker = require('./check-functionality');
var fs = require('fs');
var syntax = require('./check-syntax');
var Objects = require('./objects');

//get the test solution
var solution = new Objects.Solution();
solution.fileLocation = process.argv[2];

fs.readFile(process.argv[2], 'utf8',  function(err, data) {
  if (err) {
    return console.log('Error:', err);
  }
  solution.plain = data;
  //createModule();
  //console.log(solution.tree);
  checker(solution, callback);
});

var callback = function(err, solution) {
  if (solution.feedbackList && solution.feedbackList.length > 0) {
    var list = solution.feedbackList;
    list.forEach(function(feedback) {
      console.log('Feedbackname:', feedback.name);
      console.log('Addressee:', feedback.addressee);
      console.log('Description:', feedback.description);
      console.log('-----------------------------------');
    });
  }
};
