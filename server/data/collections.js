var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// Information about feedback a user can provide on the platform.
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
  roles: [String],
  resetPasswordToken: String
});

/**
 * Generates a hashed version of a password, using salt.
 *
 * @param {string} The password to hash.
 * @return {string} The hashed password.
 */
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Checks if the password is the same as the one stored.
 *
 * @param {string} password The password to check.
 * @return {boolean} True if the supplied password is the same as the password
 *                   stored with the user, false otherwise.
 */
userSchema.methods.validPassword = function(password) {
  if (password === null || password === '' ||
      this.password === null || this.password === '') {
    return false;
  }
  return bcrypt.compareSync(password, this.password);
};

// A function parameter for a function definition for an exercise
var paramSchema = mongoose.Schema({
  name: String,
  type: String,
  description: String
});

// A function definition for an exercise
var functionSchema = mongoose.Schema({
  name: String,
  params: [paramSchema]
});

// Metrics of a specific function in the solution
var metricsFunctionSchema = mongoose.Schema({
  name: String,
  sloc: {
    logical: Number,
    physical: Number
  },
  cyclomatic: Number,
  halstead: {
    operators: {
      distinct: Number,
      total: Number,
      identifiers: [String]
    },
    operands: {
      distinct: Number,
      total: Number,
      identifiers: [String]
    },
    length: Number,
    vocabulary: Number,
    difficulty: Number,
    volume: Number,
    effort: Number,
    bugs: Number,
    time: Number
  },
  params: Number,
  line: Number,
  cyclomaticDensity: Number
});

// A solution to an exercise
var solution = {
  code: String,
  exerciseId: String,
  userId: String,
  metrics: {
    aggregate: {
      sloc: {
        logical: Number,
        physical: Number
      },
      cyclomatic: Number,
      halstead: {
        operators: {
          distinct: Number,
          total: Number,
          identifiers: [String]
        },
        operands: {
          distinct: Number,
          total: Number,
          identifiers: [String]
        },
        length: Number,
        vocabulary: Number,
        difficulty: Number,
        volume: Number,
        effort: Number,
        bugs: Number,
        time: Number
      },
      params: Number,
      line: Number,
      cyclomaticDensity: Number
    },
    functions: [metricsFunctionSchema],
    dependencies: [String],
    maintainability: Number,
    loc: Number,
    cyclomatic: Number,
    effort: Number,
    params: Number
  }
};

var solutionSchema = mongoose.Schema(solution);

var exerciseSchema = mongoose.Schema({
  chapter: Number,
  number: Number,
  name: String,
  description: String,
  functions: [functionSchema],
  modelSolution: solution,
  testSuite: {
    code: String
  }
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
