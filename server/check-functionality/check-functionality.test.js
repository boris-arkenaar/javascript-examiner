var assert = require('assert');
var checkFunctionality = require('./check-functionality');
var database = require('../database');

describe('check-functionality.js', function() {
  before(function(done) {
    database.connect('test', function() {
      done();
    });
  });
  after(function(done) {
    database.disconnect(function() { done();});
  });
  it('should Export a single function', function() {
    assert.equal('function', typeof checkFunctionality);
  });
  it('should work with chai expect assertion style', function(done) {
    // 1. create exercise
    var code = 'describe(\'calcBMI function\', function() {\n' +
        '  it(\'should have been defined\', function() {\n' +
        '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
        '  });\n' +
        '});\n';
    var exercise = createExercise(code);
    database.putExercise(exercise, function(err, res) {
      // 2. create submitted testdata
      var submitted = {
        exerciseId: res._id,
        code: 'function askie(){return 20;}'
      };
      // 3. call check-functionality
      checkFunctionality(submitted, function(err, feedback) {
        assert.equal(null, err);
        defaultChecks(feedback, done);
      });
    });
  });
  it('should work with chai assert assertion style', function(done) {
    // 1. create exercise
    var code = 'describe(\'calcBMI function\', function() {\n' +
        '  it(\'should have been defined\', function() {\n' +
        '    assert.isFunction(studentCode.calcBMI);\n' +
        '  });\n' +
        '});\n';
    var exercise = createExercise(code);
    database.putExercise(exercise, function(err, res) {
      // 2. create submitted testdata
      var submitted = {
        exerciseId: res._id,
        code: 'function askie(){return 20;}'
      };
      // 3. call check-functionality
      checkFunctionality(submitted, function(err, feedback) {
        assert.equal(null, err);
        defaultChecks(feedback, done);
      });
    });
  });
  it('should work with chai should assertion style', function(done) {
    // 1. create exercise
    var code = 'describe(\'calcBMI function\', function() {\n' +
        '  it(\'should have been defined\', function() {\n' +
        '    studentCode.should.be.a(\'function\');\n' +
        '  });\n' +
        '});\n';
    var exercise = createExercise(code);
    database.putExercise(exercise, function(err, res) {
      // 2. create submitted testdata
      var submitted = {
        exerciseId: res._id,
        code: 'function askie(){return 20;}'
      };
      // 3. call check-functionality
      checkFunctionality(submitted, function(err, feedback) {
        assert.equal(null, err);
        defaultChecks(feedback, done);
      });
    });
  });
  it('should Return error in case there is no testSuite present',
    function(done) {
      // 1. create exercise
      var exercise = createExercise();
      database.putExercise(exercise, function(err, res) {
        assert.equal(exercise.name, res.name);
        // 2. create submitted testdata
        var submitted = {
          exerciseId: res._id,
          code: 'function calcBMI2(){return 20;}'
        };
        // 3. call check-functionality
        checkFunctionality(submitted, function(err, feedback) {
          assert.equal('object', typeof err);
          done();
        });
      });
    }
  );
  it('should Return feedback in case 1 of 1 test fails',
    function(done) {
      // 1. create exercise
      var code = 'describe(\'calcBMI function\', function() {\n' +
          '  it(\'should have been defined\', function() {\n' +
          '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
          '  });\n' +
          '});\n';
      var exercise = createExercise(code);
      database.putExercise(exercise, function(err, res) {
        // 2. create submitted testdata
        var submitted = {
          exerciseId: res._id,
          code: 'function askie(){return 20;}'
        };
        // 3. call check-functionality
        checkFunctionality(submitted, function(err, feedback) {
          assert.equal(null, err);
          assert.equal('object', typeof feedback);
          assert.equal(feedback.stats.tests, 1);
          assert.equal(feedback.stats.failures, 1);
          assert.equal(1, feedback.failures.length);
          done();
        });
      });
    }
  );
  it('should Return feedback in case all tests fails',
    function(done) {
      // 1. create exercise
      var code = 'describe(\'calcBMI function\', function() {\n' +
          '  it(\'should have been defined\', function() {\n' +
          '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
          '  });\n' +
          '  it(\'should calculate the BMI correctly\', function() {\n' +
          '    expect(studentCode.calcBMI(50,40)).equal(40, "Askie Bara");\n' +
          '  });\n' +
          '});\n';
      var exercise = createExercise(code);
      database.putExercise(exercise, function(err, res) {
        // 2. create submitted testdata
        var submitted = {
          exerciseId: res._id,
          code: 'function askie(){return 20;}'
        };
        // 3. call check-functionality
        checkFunctionality(submitted, function(err, feedback) {
          assert.equal(null, err);
          assert.equal('object', typeof feedback);
          assert.equal(feedback.stats.tests, 2);
          assert.equal(feedback.stats.failures, 2);
          assert.equal(2, feedback.failures.length);
          done();
        });
      });
    }
  );
  it('should Return feedback in case some tests fails',
    function(done) {
      // 1. create exercise
      var code = 'describe(\'calcBMI function\', function() {\n' +
          '  it(\'should have been defined\', function() {\n' +
          '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
          '  });\n' +
          '  it(\'should calculate the BMI correctly\', function() {\n' +
          '    expect(studentCode.calcBMI(50,40)).equal(40, "Askie Bara");\n' +
          '  });\n' +
          '});\n';
      var exercise = createExercise(code);
      database.putExercise(exercise, function(err, res) {
        // 2. create submitted testdata
        var submitted = {
          exerciseId: res._id,
          code: 'function calcBMI(){return 20;}'
        };
        // 3. call check-functionality
        checkFunctionality(submitted, function(err, feedback) {
          assert.equal(null, err);
          assert.equal('object', typeof feedback);
          assert.equal(feedback.stats.tests, 2);
          assert.equal(feedback.stats.failures, 1);
          assert.equal(feedback.stats.passes, 1);
          assert.equal(1, feedback.failures.length);
          assert.equal(1, feedback.passes.length);
          done();
        });
      });
    }
  );
  it('should Return feedback in case all tests passes',
    function(done) {
      // 1. create exercise
      var code = 'describe(\'calcBMI function\', function() {\n' +
          '  it(\'should have been defined\', function() {\n' +
          '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
          '  });\n' +
          '  it(\'should calculate the BMI correctly\', function() {\n' +
          '    expect(studentCode.calcBMI(50,40)).equal(20, "Askie Bara");\n' +
          '  });\n' +
          '});\n';
      var exercise = createExercise(code);
      database.putExercise(exercise, function(err, res) {
        // 2. create submitted testdata
        var submitted = {
          exerciseId: res._id,
          code: 'function calcBMI(){return 20;}'
        };
        // 3. call check-functionality
        checkFunctionality(submitted, function(err, feedback) {
          assert.equal(null, err);
          assert.equal('object', typeof feedback);
          assert.equal(feedback.stats.tests, 2);
          assert.equal(feedback.stats.failures, 0);
          assert.equal(feedback.stats.passes, 2);
          assert.equal(0, feedback.failures.length);
          assert.equal(2, feedback.passes.length);
          done();
        });
      });
    }
  );
});

function defaultChecks(feedback, done) {
  assert.equal('object', typeof feedback);
  assert.equal(feedback.stats.tests, 1);
  assert.equal(feedback.stats.failures, 1);
  assert.equal(1, feedback.failures.length);
  done();
}

function createExercise(code) {
  var exercise = {
    chapter: 5,
    number: 5,
    name: 'Bereken Bmi',
    description: 'Schrijf een functie calcBMI() met parameters lengte ' +
      'en gewicht, die het BMI teruggeeft.',
    functions: [
      {
        name: 'calcBMI',
        params: [{name: 'lengte'}, {name: 'gewicht'}]
      }
    ],
    testSuite: {
      code: code
    }
  };
  return exercise;
}
