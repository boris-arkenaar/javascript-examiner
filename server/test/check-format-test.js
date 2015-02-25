var assert = require('assert');
var checkFormat = require('../check-format/check-format');

describe('Functie check-format', function() {
  it('Test check-format', function() {
    assert.equal(checkFormat('var a = 0;', function() {}), 'undefined');
  });
});
