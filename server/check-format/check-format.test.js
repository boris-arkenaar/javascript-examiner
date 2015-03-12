var assert = require('assert');
var checkFormat = require('../check-format/check-format');

var testregel = 'function calcBMI() {};';

describe('Functie check-format', function() {
  it('Test check-format', function() {
    assert.equal(checkFormat(testregel, function() {}), 'undefined');
  });
});
