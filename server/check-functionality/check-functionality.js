var fs = require('fs');
var database = require('../database');
var crypto = require('crypto');
var Mocha = require('mocha');
var reporter = Mocha.reporters.JSON;

const tempPath = __dirname + '/../../tmp/';
createTempDir(tempPath);

module.exports = function(submitted, callback) {
  var solution = submitted.code;
  database.getExercise(submitted.exerciseId, function(err, exercise) {
    if (err) {
      callback(err);
    } else {
      var extendedSolution = addExportsToSolution(solution,
          exercise.functions);
      var solutionFileId = saveSolution(extendedSolution);

      var extendedTestSuite = addSolutionToTestSuite(exercise.testSuite.code,
          solutionFileId);
      var testSuiteFileId = saveTestSuite(extendedTestSuite, solutionFileId);
      runTestSuite(testSuiteFileId, callback);
    }
  });
};

function addExportsToSolution(solution, functions) {
  var exportsCode = 'module.exports = {\n';
  var i;
  var fn;
  functions.forEach(function(fnData) {
    fn = fnData.name;
    exportsCode += '  ' + fn + ': typeof ' + fn + ' != \'undefined\' ? ' +
        fn + ' : undefined,\n';
  });
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
  //require studentCode + several assertion styles.
  var requireStatement =
      'var studentCode = require(\'' + solutionFilePath + '\');\n' +
      'var expect = require(\'chai\').expect;\n' +
      'var assert = require(\'chai\').assert;\n' +
      'var should = require(\'chai\').should();\n';
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
  var mocha = new Mocha({
    reporter: reporter
  });
  var cache = prepareCache();
  var runner;
  var ended = false;

  mocha.addFile(filePath);
  runner = mocha.run(function(failureCount) {
    ended = true;
    clearCache(cache);
    if (runner && runner.testResults) {
      callback(null, runner.testResults);
    } else {
      var err = new Error('No test results available');
      callback(err);
    }
  });
  runner.on('end', function() {
    if (!ended) {
      clearCache(cache);
      var err = new Error('Test runner failed unexpectedly');
      callback(err);
    }
  });
}

function prepareCache() {
  var key;
  var cache = {};
  for (key in require.cache) {
    cache[key] = true;
  }
  return cache;
}

function clearCache(cache) {
  var key;
  for (key in require.cache) {
    if (!cache[key]) {
      delete require.cache[key];
    }
  }
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
