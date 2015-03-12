var assert = require('assert');
var checkMntnblty = require('../check-maintainability/check-maintainability');

var testregel = 'function calcBMI() {};';

describe('Functie check-maintainability', function() {
  it('Test check-maintainability', function() {
    assert.equal(checkMntnblty(testregel, function() {}), 'undefined');
  });
});
