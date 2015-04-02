var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  email: String,
  password: String
});

var paramSchema = mongoose.Schema({
  name: String,
  type: String,
  description: String
});

var functionSchema = mongoose.Schema({
  name: String,
  params: [paramSchema]
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

var testSuiteSchema = mongoose.Schema();

exports.User = mongoose.model('User', userSchema);
mongoose.model('Exercise', exerciseSchema);
exports.Exercise = mongoose.model('Exercise');
