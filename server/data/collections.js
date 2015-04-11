var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  email: String,
  password: String,
  roles: [String]
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

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
