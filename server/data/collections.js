var mongoose = require('mongoose');

var exerciseSchema = mongoose.Schema({
  chapter: Number,
  number: Number,
  //number: String,
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

exports.Exercise = mongoose.model('Exercise', exerciseSchema);
