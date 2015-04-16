var fs = require('fs');
var description;
var module;

module.exports = function(check, feedback, cb) {
  var src;
  var trg;
  var pos;
  var callback = function(value) {
    cb(value);
  };
  searchError(check, feedback, callback);
};

function generateFileName(name) {
  var localName = './server/';
  localName = localName.concat(name);
  localName = localName.concat('-feedback');
  return localName;
}

function createFile(filename, callback) {
  fs.writeFile(filename, '', function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

function checkFile(name) {
  var fn = generateFileName(name);
  fs.exists(fn, function(err) {
    console.log(err);
  });
}

function searchError(module, feedback, callback) {
  // search for error,
  // if not found create error with description is equal to error
  // read file and put the content in an array
  // then check the feedback with items from the array
  // if found, replace feedback with entrance
  // otherwise, add feedback to file
  var fn = generateFileName(module);
  description = feedback.description;
  fs.open(fn, 'a+', function() {
    fs.readFile(fn, 'utf8', function(err, buf) {
      if (err) {
        return console.log(err);
      }
      var found = false;
      var jsonData = {};
      var text = buf.toString().trim();
      if (text !== '') {
        jsonData = JSON.parse(text);
        Object.keys(jsonData).map(function(value, index, key) {
          if (key[index] === description) {
            feedback.description = jsonData[value];
            found = true;
          }
        });
      }
      if (found === false) {
        // append description to file
        var descr = feedback.description;
        if (descr !== '') {
          jsonData[descr] = descr;
        }
        fs.writeFile(fn, JSON.stringify(jsonData), function(err) {
          if (err) {
            return console.log(err);
          }
        });
      }
      callback(feedback.description);
    });
  });
}
