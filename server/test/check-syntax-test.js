var assert = require('assert');
var checkSyntax = require('../check-syntax/check-syntax');

describe('Functie check-syntax', function() {
  it('Test check-syntax', function() {
    assert.equal(checkSyntax('var a = 0;', function() {}), 'undefined');
  });
});
