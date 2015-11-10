'use strict';

var gulp = require('gulp');
var mocha = require('gulp-spawn-mocha');
var plugins = require('gulp-load-plugins')();
var DEBUG = process.env.NODE_ENV === 'debug',
      CI = process.env.CI === 'true';

var paths = {
  lint: ['./gulpfile.js', './src/**/*.js', './bin/*'],
  watch: ['./gulpfile.js', './src/**', './test/**/*.js', '!test/{temp,temp/**}'],
  tests: ['./test/**/*.js', '!test/{temp,temp/**}'],
  source: ['./lib/*.js', './bin/*']
};

var plumberConf = {};

if (CI) {
  plumberConf.errorHandler = function(err) {
    throw err;
  };
}

gulp.task('lint', function () {
  return gulp.src(paths.lint)
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.plumber(plumberConf))
    .pipe(plugins.jscs())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

  
gulp.task('istanbul', function () {
  return gulp.src(paths.tests, {read: false})
    .pipe(mocha({
      debugBrk: DEBUG,
      R: CI ? 'spec' : 'nyan',
      istanbul: !DEBUG
    }));
});

gulp.task('bump', ['test'], function () {
  var bumpType = plugins.util.env.type || 'patch'; // major.minor.patch

  return gulp.src(['./package.json'])
    .pipe(plugins.bump({ type: bumpType }))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', ['test'], function () {
  gulp.watch(paths.watch, ['test']);
});

gulp.task('test', ['lint', 'istanbul']);

gulp.task('release', ['bump']);

gulp.task('default', ['test']);
