var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('serve', function() {
  nodemon({
    script: 'server.js',
    ext: 'html json js',
    env: {
      'NODE_ENV': 'development'
    }
  });
});

gulp.task('default', ['serve']);

