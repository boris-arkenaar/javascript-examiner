var esprima = require('esprima');
var escomplex = require('escomplex');
var walker = require('escomplex-ast-moz');

var esprimaOptions = {
  tolerant:false,
  loc: true,
  range: true,
  raw: true,
  tokens: true
};

var escomplexOptions = {
};

module.exports = function(solution, callback) {
  var ast = esprima.parse(solution, esprimaOptions);
  var artifacts = escomplex.analyse(ast, walker, escomplexOptions);

  callback(null, null, artifacts);
};
