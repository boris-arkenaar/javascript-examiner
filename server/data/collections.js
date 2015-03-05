var mongoose = require('mongoose');

var exerciseSchema = mongoose.Schema({
  chapter: Number,
  number: Number,
  //number: String,
  name: String,
  description: String,
});

exports.Exercise = mongoose.model('Exercise', exerciseSchema);
