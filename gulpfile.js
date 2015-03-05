var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var child_process = require('child_process');
var mocha = require('gulp-mocha');

gulp.task('serve', ['lint', 'test1', 'test2', 'test3'], function() {
  nodemon({
    script: 'server/server.js',
    ext: 'html json js',
    env: {
      'NODE_ENV': 'development'
    }
  });

  gulp.watch('server/**/*.js', ['lint']);
});

gulp.task('lint', function() {
  return gulp.src('server/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jscs());
});

gulp.task('mongoDB', function() {
  child_process.exec('mongod -dbpath ./server/data/db', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  })
});

gulp.task('test1', function() {
    return gulp.src('server/test/check-syntax-test.js', {read: false})
        .pipe(mocha()
        .on("error", handleError));
});

gulp.task('test2', function() {
    return gulp.src('server/test/check-format-test.js', {read: false})
        .pipe(mocha()
        .on("error", handleError));
});

gulp.task('test3', function() {
    return gulp.src('server/test/check-functionality-test.js', {read: false})
        .pipe(mocha()
        .on("error", handleError));
});

gulp.task('default', ['serve']);

gulp.task('default', ['serve', 'mongoDB']);


function handleError(err) {
  console.log('');
  this.emit('end');
}

