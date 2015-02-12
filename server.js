var checkFormat = require('./check-format');

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var getRawBody = require('raw-body');
var typer = require('media-typer');
var multer = require('multer');
var Objects = require("./objects");

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



var server = app.listen(3030, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example http://%s:%s', host, port);
});