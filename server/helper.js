//Utility: decode base64
exports.decode = function(encoded) {
  return new Buffer(encoded, 'base64').toString();
};
