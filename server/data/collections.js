var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userFeedbackSchema = mongoose.Schema({
  subject: String,
  feedback: String,
  context: {
    exerciseId: String,
    userId: String
  }
});

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
mongoose.model('UserFeedback', userFeedbackSchema);
exports.UserFeedback = mongoose.model('UserFeedback');
