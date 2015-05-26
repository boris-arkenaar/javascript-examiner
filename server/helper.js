/**
 * Decodes a base64 encoded string.
 *
 * @param {string} encoded A base64 encoded string.
 * @return {string} The decoded version of the input string.
 */
exports.decode = function(encoded) {
  return new Buffer(encoded, 'base64').toString();
};
