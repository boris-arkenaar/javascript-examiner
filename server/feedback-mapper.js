var fs = require('fs');

module.exports = function(check, feedback) {
  var src;
  var trg;
  var pos;
  var module = check;
  checkFile(module);
  feedback.description = searchError(module, feedback);
  checkFile('Algemeen');
  feedback.description = searchError('Algemeen', feedback);
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
  fs.exists(fn, function(exist) {
    if (!exist) {
      createFile(fn);
    }
  });
  // if not file exist, create file
}

function searchError(module, feedback) {
// search for error, if not found create error with description is equal to error
// read file and put the content in an array
// then check the feedback with items from the array
// if found, replace feedback with entrance
// otherwise, add feedback to file
  var fn = generateFileName(module);
  var input = fs.createReadStream(fn);
  var lines = fs.readFileSync(fn).toString().split('\n');
  var found = false;
  console.log('1: ' + feedback.description);
  if (lines.length > 1) {
    lines.forEach(function(v) {
      if (v != '') {
        src = v.split(';');
        console.log('2a: ' + src[0]);
        console.log('2b: ' + src[1]);
        pos = feedback.description.indexOf(src[0]);
        console.log('2: ' + v);
        console.log('3: ' + pos)
        if (pos > -1) {
          feedback.description = feedback.description.replace(src[0], src[1]);
          found = true;
        }
      }
    });
  }
  var descr = feedback.description;
  console.log('4: ' + descr);
  console.log('5: ' + found);
  if (found === false) {
    // append description to file
    fs.appendFile(fn, descr + ';' + descr + '\n', function(err) {
      console.log('6: ' + err);
    });
  }
  return feedback.description;
}

//Unexpected identifier;Onverwachte variabele
