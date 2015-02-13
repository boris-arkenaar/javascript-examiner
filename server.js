var checkFormat = require('./check-format');

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var getRawBody = require('raw-body');
var typer = require('media-typer');
var multer = require('multer');
var Objects = require('./objects');
var checkSyntax = require('./check-syntax');
var checkFormat = require('./check-format');
var checkFunctionality = require('./check-functionality');

var app = express();


app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());


app.post('/post', function(req, res) {
  var data
//  // Met de volgende statement wordt de value op het scherm gezet, behorende bij de key "sleutel",
//  // die geplaatst is in de body van het POST bericht.
//  //  console.log(req.body.sleutel);
//  data = req.body.sleutel;
//  check(data);
//  res.send('Gereed');

//  // Met de volgende statement wordt de value op het scherm gezet, behorende bij de key "sleutel",
//  // die geplaatst is in URL Parameter van het POST bericht.
//  //  console.log(req.query.sleutel);
//  data = req.query.sleutel;
//  check(data);
//  res.send('Gereed');

//  // Met het volgende stuk code wordt een meegestuurd bestand gecheckt.
//  // De naam van het bestand staat in de key met de naam "sleutel"
//  var raw = req.files.sleutel.path
//  var pad = raw.replace("\\","/");
//  fs.readFile(pad, 'utf8',  function(err, data) {
//	if(err) return console.log('Error:', err);
//	checkFormat(data, function(err, feedback) {

//          if(err) {

//            return console.log('error at checkFormat: ' + err);

//            console.log(feedback);
//          }
//        });
//  });

  res.send('Gereed');

});



function check(data) {
  checkFormat(data, function(err, feedback) {

    if(err) {

      return console.log('error at checkFormat: ' + err);

      console.log(feedback);
    }
  });
};

function getCheckHandler(check) {
  return function (request, response) {
    var encoded = request.body.code;
    console.log('encoded', encoded);
    var buffer = new Buffer(encoded, 'base64');
    var code = buffer.toString();
    console.log('code', code);

    check(code, function(err, feedback, artifacts) {
      var responseData;

      if (err) {
        responseData = err;
      } else {
        responseData = {
          feedback: feedback || [],
          artifacts: artifacts || {}
        }
      }

      response.send(responseData);
    });
  }
}

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/elements', express.static(__dirname + '/elements'));
app.post('/rest/syntax', getCheckHandler(checkSyntax));
app.post('/rest/format', getCheckHandler(checkFormat));
app.post('/rest/functionality', getCheckHandler(checkFunctionality));
app.use('/rest', express.static(__dirname + '/rest'));
app.use(express.static(__dirname + '/public'));

var server = app.listen(3030, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example http://%s:%s', host, port);
});