var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  email: String,
  password: String
});

var exerciseSchema = mongoose.Schema({
  chapter: Number,
  number: Number,
  name: String,
  description: String,
  functions: [functionSchema],
  testSuite: {
    code: String
  }
});

var functionSchema = mongoose.Schema({
  name: String,
  params: [paramSchema]
});

var paramSchema = mongoose.Schema({
  name: String
});

var testSuiteSchema = mongoose.Schema();

exports.User = mongoose.model('User', userSchema);
exports.Exercise = mongoose.model('Exercise', exerciseSchema);
