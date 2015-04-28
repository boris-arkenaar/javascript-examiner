var assert = require('chai').assert;
var checkMaintainability = require('./check-maintainability');

describe('check-maintainability.js', function() {
  it('should Export a single function', function() {
    assert.equal('function', typeof checkMaintainability);
  });
  it('should return only artefacts', function(done) {
    var input = {
      code: 'function calcBMI() {};  '
    };
    checkMaintainability(input, function(err, feedback, artefacts) {
      assert.isNull(err);
      assert.isNull(feedback);
      assert.isObject(artefacts);
      done();
    });
  });
});
