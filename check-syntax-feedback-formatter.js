var exports = module.exports = {};

exports.parseError = function ParseError (err, src) {
  if (!(this instanceof ParseError)) {
    return new ParseError(err, src);
  }
  SyntaxError.call(this);
  this.message = err.message.replace(/^Line \d+: /, '');
  this.line = err.lineNumber;
  this.column = err.column;
  this.annotated = '/*' +
      Array(this.column).join(' ') + '^' +
      '\n' +
      'ParseError: ' + this.message +
      '\n*/\n';
}

exports.parseError.prototype = Object.create(SyntaxError.prototype);
exports.parseError.prototype.constructor = exports.parseError;
exports.parseError.prototype.toString = function() {
  return this.annotated;
};

exports.parseError.prototype.inspect = function() {
  return this.annotated;
};
