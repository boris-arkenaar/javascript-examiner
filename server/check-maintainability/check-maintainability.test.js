var assert = require('chai').assert;
var checkMaintainability = require('./check-maintainability');

describe('check-maintainability.js', function() {
  it('should Export a single function', function() {
    assert.equal('function', typeof checkMaintainability);
  });
  it('should return only artefacts', function(done) {
    var input = {
      //code has trailing whitespace at end of line
      //code has no empty line at end of file
      code: 'function calcBMI() {};  '
    };
    checkMaintainability(input, function(err, feedback, artefacts) {
      assert.isNull(feedback);
      assert.isNull(err);
      assert.isObject(artefacts);
      done();
    });
  });
});
