var mongoose = require('mongoose');

var paramSchema = mongoose.Schema({
  name: String
});

var functionSchema = mongoose.Schema({
  name: String,
  params: [paramSchema]
});

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

var testSuiteSchema = mongoose.Schema();
mongoose.model('Exercise', exerciseSchema);
exports.Exercise = mongoose.model('Exercise');
