var fs = require('fs');

module.exports = function(check, feedback) {
  var src;
  var trg;
  var pos;
  var module = check;
  searchError(module, feedback);
  return feedback;
};

function generateFileName(name) {
  var localName = './server/';
  localName = localName.concat(name);
  localName = localName.concat('-feedback');
  return localName;
}

function createFile(filename) {
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

function searchError(module, feedback) {
// search for error, if not found create error with description is equal to error
// read file and put the content in an array
// then check the feedback with items from the array
// if found, replace feedback with entrance
// otherwise, add feedback to file
  var fn = generateFileName(module);
  var contents = fs.readFileSync(fn).toString();
  var found = false;
  if (contents.toString().trim() !== '') {
    var lines = contents.toString().split('\n');
    lines.map(function(e, i, a) {
      if (e.trim() === '') {
        lines.splice(i, 1);
      }
    });
    lines.map(function(x) {
      src = x.split(';');
      if (feedback.description === src[0]) {
        found = true;
        feedback.description = src[1];
      }
    });
  }
  if (found === false) {
    // append description to file
    var descr = feedback.description;
    fs.appendFile(fn, descr + ';' + descr + '\n', function(err) {
      if (err) {
        return console.log(err);
      }
    });
  }
}
