var assert = require('assert');
var checkFunctionality = require('../check-functionality/check-functionality');

describe('Functie check-functionality', function() {
  it('Test check-functionality', function() {
    assert.equal(checkFunctionality('var a = 0;', function() {}), 'undefined');
  });
});
