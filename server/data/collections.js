var mongoose = require('mongoose');

var exerciseSchema = mongoose.Schema({
  chapter: Number,
  number: Number,
  //number: String,
  name: String,
  description: String,
  functions: [functionSchema]
});

var functionSchema = mongoose.Schema({
  name: String,
  params: [paramSchema]
});

var paramSchema = mongoose.Schema({
  name: String
});

exports.Exercise = mongoose.model('Exercise', exerciseSchema);
