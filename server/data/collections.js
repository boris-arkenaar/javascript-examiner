var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  email: String,
  password: String,
  roles: [String],
  resetPasswordToken: String
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  if (password === null || password === '' ||
      this.password === null || this.password === '') {
    return false;
  }
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
  modelSolution: {
    code: String
  },
  testSuite: {
    code: String
  }
});

var solutionSchema = mongoose.Schema({
  code: String,
  exerciseId: String,
  userId: String
});

var testSuiteSchema = mongoose.Schema();

mongoose.model('User', userSchema);
exports.User = mongoose.model('User');
mongoose.model('Exercise', exerciseSchema);
exports.Exercise = mongoose.model('Exercise');
mongoose.model('Solution', solutionSchema);
exports.Solution = mongoose.model('Solution');
