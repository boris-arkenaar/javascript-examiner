var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var child_process = require('child_process');

gulp.task('serve', ['lint'], function() {
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

gulp.task('default', ['serve', 'mongoDB']);