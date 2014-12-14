var express = require('express');
var multer = require('multer');
var app = express();
app.engine('html', require('ejs').renderFile);
app.use(multer({dest: './tmp/'}));
var fs = require('fs');
var checkSyntax = require('./index-check-syntax');
//app.use(multer({inMemory: true}));
//Must be put before app.use(app.router);


app.get('/', function (req, res) {
  res.render('form.html');
})

app.post('/file-upload', function (req, res, next) {
  console.log(req.body);
  console.log(req.files.thumbnail.name);
  var solutionFN = req.files.thumbnail.name;
  checkSyntax(__dirname + '\\tmp\\'+ solutionFN, function(err, filename) {
    if(err) {
      return console.log('error at server.js');
    }
    res.render(filename);
  });
  
  
});

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})