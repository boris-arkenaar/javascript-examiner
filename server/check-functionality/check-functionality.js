var fs = require('fs');
var database = require('../database');
var crypto = require('crypto');
var Mocha = require('mocha');
var reporter = Mocha.reporters.JSON;

/**
 * The path of the directory where the solution and test suite files are stored
 * for running the test suite.
 * @type {string}
 */
const tempPath = __dirname + '/../../tmp/';
createTempDir(tempPath);

/**
 * Checks the functionality of a solution
 * by running the test suite of the corresponding exercise.
 *
 * @param {Object} submitted Information of the submitted solution.
 * @param {function} callback
 */
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

/**
 * Adds all function defined by the exercise to the node.js module.exports
 * object in the solution code. This makes those functions available for the
 * test suite.
 *
 * Code appended to the solution will be of the following form:
 * ```
 * module.exports = {
 *   functionA: typeof functionA != 'undefined' ? functionA : undefined,
 *   functionB: typeof functionB != 'undefined' ? functionB : undefined,
 *   functionC: typeof functionC != 'undefined' ? functionC : undefined,
 * };
 * ```
 *
 * @param {string} solution The solution code.
 * @param {Array.<Object>} functions Information about the functions
 *                                   defined by the exercise.
 * @return {string} The solution with the exports definition appended.
 */
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

/**
 * Saves a solution to a file on disk to be used by the test suite.
 *
 * For the name of the file a hash of the solution code is used.
 * This way every solution will be savely stored in a file with a unique file
 * name. But when two solutions happen to be exactly the same, no extra
 * storage is wasted, for they can safely be stored in the same file.
 *
 * @param {string} solution The solution code.
 * @param {string} The ID of the saved file.
 */
function saveSolution(solution) {
  var fileId = getHash(solution);
  var filePath = tempPath + fileId;
  fs.writeFileSync(filePath, solution);
  return fileId;
}

/**
 * Modifies the testsuite code to inject the solution to be tested.
 * The functions of the solution are available to the test suite
 * via the variable `studentCode`.
 * Also defines the tools needed by the test suite,
 * like `expect`, `assert` and `should`.
 *
 * The code prepended to the test suite looks something like this:
 * ```
 * var studentCode = require('/javascript-examiner/server/check-functionality/../../tmp/0a246b11391c88201d6b2b8a951d44521ead79b2');
 * var expect = require('chai').expect;
 * var assert = require('chai').assert;
 * var should = require('chai').should();
 * ```
 *
 * @param {string} testSuite The test suite code.
 * @param {string} solutionFileId The ID of the solution file.
 * @return {string} The test suite with the definitions prepended.
 */
function addSolutionToTestSuite(testSuite, solutionFileId) {
  var solutionFilePath = tempPath + solutionFileId;
  // Require studentCode + several assertion styles
  var requireStatement =
      'var studentCode = require(\'' + solutionFilePath + '\');\n' +
      'var expect = require(\'chai\').expect;\n' +
      'var assert = require(\'chai\').assert;\n' +
      'var should = require(\'chai\').should();\n';
  return requireStatement + '\n\n' + testSuite;
}

/**
 * Saves the test suite to a file so it can be run from node.js.
 * The file will get the same name as the solution file it test,
 * but with '_test' appended to it.
 *
 * @param {string} testSuite The test suite code.
 * @param {string} solutionFileId The ID of the solution file this test suite
 *                                is prepared to test.
 * @return {string} The ID of the saved file.
 */
function saveTestSuite(testSuite, solutionFileId) {
  var testSuiteFileId = solutionFileId + '_test';
  var filePath = tempPath + testSuiteFileId;
  fs.writeFileSync(filePath, testSuite);
  return testSuiteFileId;
}

/**
 * Runs the test suite.
 * Reports the test results to the callback.
 *
 * @param {string} The ID of the solution file.
 * @param {function} callback
 */
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

/**
 * Remembers the current cached elements in the node.js cache for required
 * modules.
 *
 * @return {Object.<string, boolean>} The cache entries currently in the
 *                                    node.js cache.
 */
function prepareCache() {
  var key;
  var cache = {};
  for (key in require.cache) {
    cache[key] = true;
  }
  return cache;
}

/**
 * Clears the cache entries, in the node.js cache for required files,
 * that have been added by the test suite. We need to do this to make sure
 * running the test suite again uses the latest test suite and solution.
 * And the cache does not get flooded with unnecessary items.
 *
 * @param {Object.<string, boolean>} cache The cache entries that were in the
 *                                         cache already before the test suite
 *                                         was run.
 */
function clearCache(cache) {
  var key;
  for (key in require.cache) {
    if (!cache[key]) {
      delete require.cache[key];
    }
  }
}

/**
 * Gets a hash of the data provided.
 *
 * @param {mixed} data The data to generate a hash for.
 * @return {string} The hash of the data.
 */
function getHash(data) {
  var shasum = crypto.createHash('sha1');
  shasum.update(data);
  return shasum.digest('hex');
}

/**
 * Creates the temp directory for storing the solution and test suite files,
 * if it does not exist yet.
 *
 * @param {string} tempPath The temp directory path.
 */
function createTempDir(tempPath) {
  fs.mkdir(tempPath, function(error) {
    if (error && error.code !== 'EEXIST') {
      console.log('error reading or creating temp directory', tempPath);
    }
  });
}
