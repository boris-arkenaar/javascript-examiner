var fs = require('fs');
var crypto = require('crypto');
var Mocha = require('mocha');

const tempPath = __dirname + '/../../tmp/';
createTempDir(tempPath);

module.exports = function(submitted, callback) {
  var exercise = getExercise(submitted.exerciseId);
  var solution = submitted.code;
  var testSuite = getTestSuite(exercise.id).code;

  var extendedSolution = addExportsToSolution(solution, exercise.api);
  var solutionFileId = saveSolution(extendedSolution);

  var extendedTestSuite = addSolutionToTestSuite(testSuite, solutionFileId);
  var testSuiteFileId = saveTestSuite(extendedTestSuite, solutionFileId);

  runTestSuite(testSuiteFileId, callback);
};

function getExercise(exerciseId) {
  return {
    exerciseId: exerciseId,
    api: ['calcBMI']
  };
}

function getTestSuite(exerciseId) {
  return {
    code: '\n' +
      'var expect = require(\'chai\').expect;\n' +
      '\n' +
      'describe(\'calcBMI function\', function() {\n' +
      '  it(\'should have been defined\', function() {\n' +
      '    expect(studentCode.calcBMI).to.be.a(\'function\');\n' +
      '  });\n' +
      '});\n'
  };
}

function addExportsToSolution(solution, functions) {
  var exportsCode = 'module.exports = {\n';
  var i;
  var fn;
  for (i in functions) {
    fn = functions[i];
    exportsCode += '  ' + fn + ': typeof calcBMI != \'undefined\' ? ' +
        fn + ' : undefined,\n';
  }
  exportsCode += '};\n';
  return solution  + '\n\n' + exportsCode;
}

function saveSolution(solution) {
  var fileId = getHash(solution);
  var filePath = tempPath + fileId;
  fs.writeFileSync(filePath, solution);
  return fileId;
}

function addSolutionToTestSuite(testSuite, solutionFileId) {
  var solutionFilePath = tempPath + solutionFileId;
  var requireStatement =
      'var studentCode = require(\'' + solutionFilePath + '\');';
  return requireStatement + '\n\n' + testSuite;
}

function saveTestSuite(testSuite, solutionFileId) {
  var testSuiteFileId = solutionFileId + '_test';
  var filePath = tempPath + testSuiteFileId;
  fs.writeFileSync(filePath, testSuite);
  return testSuiteFileId;

}

function runTestSuite(fileId, callback) {
  var filePath = tempPath + fileId;
  var mocha = new Mocha();

  mocha.addFile(filePath);
  mocha.run(function(failureCount) {
    var result;
    if (failureCount > 0) {
      result = 'Tests failed: ' + failureCount;
    } else {
      result = 'All tests passed!';
    }
    callback(null, [{
      name: 'Test results',
      description: result
    }]);
  });
}

function getHash(data) {
  var shasum = crypto.createHash('sha1');
  shasum.update(data);
  return shasum.digest('hex');
}

function createTempDir(tempPath) {
  fs.mkdir(tempPath, function(error) {
    if (error && error.code !== 'EEXIST') {
      console.log('error reading or creating temp directory', tempPath);
    }
  });
}
