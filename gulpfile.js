var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var child_process = require('child_process');
var mocha = require('gulp-mocha');

gulp.task('serve', ['lint', 'unittest'], function() {
  nodemon({
    script: 'server/server.js',
    ext: 'html json js',
    env: {
      'NODE_ENV': 'development'
    }
  });

  gulp.watch('server/**/*.js', ['lint', 'unittest']);
});

gulp.task('unittest', function() {
    gulp.src('server/**/*.test.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}))
        .on("error", handleError);
});

gulp.task('lint', function() {
  return gulp.src('server/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jscs());
});

gulp.task('mongoDB', function() {
  child_process.exec('mongod -dbpath ./server/data/db');
  setTimeout(function() {
    child_process.exec('node ./server/data/fixtures.js');
  }, 3000);
});

gulp.task('default', ['serve', 'mongoDB', 'unittest']);

function handleError(err) {
  console.log('');
  this.emit('end');
}

