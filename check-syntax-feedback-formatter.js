var exports = module.exports = {};

exports.parseError = function ParseError (err, src, file) {
  if (!(this instanceof ParseError)) {
    return new ParseError(err, src, file);
  }
  SyntaxError.call(this);
  this.message = err.message.replace(/^Line \d+: /, '');
  this.line = err.lineNumber;
  this.column = err.column;
  this.annotated = '\n' +
      //+ (file || '(anonymous file)')
      //+ ':' + this.line
      //+ '\n'
      //+ src.split('\n')[this.line - 1]
      Array(this.column).join(' ') + '^' +
      '\n' +
      'ParseError: ' + this.message;
}

exports.parseError.prototype = Object.create(SyntaxError.prototype);
exports.parseError.prototype.constructor = exports.parseError;

exports.parseError.prototype.toString = function() {
  return this.annotated;
};

exports.parseError.prototype.inspect = function() {
  return this.annotated;
};
