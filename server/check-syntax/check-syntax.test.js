var assert = require('assert');
var checkSyntax = require('./check-syntax');

describe('check-syntax.js', function() {
  it('should Export a single function', function() {
    assert.equal('function', typeof checkSyntax);
  });
  it('should report no feedback when input is ok', function(done) {
    var input = {
      code: 'console.log("Flawless");'
    };
    checkSyntax(input, function(err, feedback) {
      assert.equal(feedback.length, 0);
      done();
    });
  });
  it('should create an AST when input is ok', function(done) {
    var input = {
      code: 'console.log("Flawless");'
    };
    checkSyntax(input, function(err, feedback, artifacts) {
      assert.equal('object', typeof artifacts.ast);
      // assert.equal(0, feedback.length);
      done();
    });
  });
  it('should report feedback when syntax not ok', function(done) {
    var input = {
      //code has trailing whitespace at end of line
      code: 'console.log{"Flaw"};'
    };
    checkSyntax(input, function(err, feedback) {
      assert.equal(feedback.length, 1);
      done();
    });
  });
});
