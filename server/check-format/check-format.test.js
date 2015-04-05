var assert = require('assert');
var checkFormat = require('./check-format');

describe('check-format.js', function() {
  it('should Export a single function', function() {
    assert.equal('function', typeof checkFormat);
  });
  it('should report no feedback when input is ok', function(done) {
    var input = {
      code: 'function calcBMI() {};\n'
    };
    checkFormat(input, function(err, feedback) {
      assert.equal(0, feedback.length);
    });
    done();
  });
  it('should report feedback when input has a flaw', function(done) {
    var input = {
      //code has trailing whitespace at end of line
      code: 'function calcBMI() {};  \n'
    };
    checkFormat(input, function(err, feedback) {
      assert.equal(1, feedback.length);
      done();
    });
  });
  it('should report feedback when input has multiple flaws', function(done) {
    var input = {
      //code has trailing whitespace at end of line
      //code has no empty line at end of file
      code: 'function calcBMI() {};  '
    };
    checkFormat(input, function(err, feedback) {
      assert.equal(2, feedback.length);
      done();
    });
  });
});
