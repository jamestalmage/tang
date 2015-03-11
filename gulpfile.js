var gulp = require('gulp');
var exec = require('child_process').exec;
var clean = require('gulp-clean');
var gutil = require('gulp-util');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var spawnMocha = require('gulp-spawn-mocha');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var processFiles = require('./processFiles');
var karma = require('karma').server;
var fs = require('fs');

gulp.task('cover', function(cb) {
  gulp.src(['src/**/*.js'])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(['mocha-globals.js', 'test/**/*-test.js', 'test/*-test.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports(
          {dir: './coverage/' + (process.env.NG_UTILS_PARSER || 'recast')}
        ))
        .on('end', cb);
    });
});

gulp.task('test', function() {
  return gulp.src(['test/**/*-test.js', 'test/*-test.js'], {read: false})
    .pipe(spawnMocha({
      growl:true,
      r:'mocha-globals.js',
      colors:true
    }))
    .on('error', gutil.log);
});

gulp.task('watch', function() {
  gulp.watch(['test/**', 'src/**'], ['test']);
});

gulp.task('lint', function() {
  return gulp.src(['src/**', 'test/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('check-style', function() {
  return gulp.src(['src/**', 'test/**'])
    .pipe(jscs());
});

function cloneTask(url, dir) {
  return function(cb) {
    exec('mkdir -p plugins && git clone ' + url + ' ' + dir,
      function(err, stdout, stderr) {
        if (err) {
          console.log(stdout);
          console.log(stderr);
        }
        cb(err);
      }
    );
  }
}

function execTask(dir) {
  return function(cb) {
    exec('cd ./plugins/' + dir + ' && npm i && npm i ../.. && gulp',
      function(err, stdout, stderr) {
        var capsDir = dir.toUpperCase();
        if (err) {
          console.log(gutil.colors.red([
            '************************************************************',
            '*************** BEGIN FAILURE: ' + capsDir + ' *******************'
          ].join('\n')));

          console.log(stdout);
          console.log(stderr);

          console.log(gutil.colors.red([
            '*********** END FAILURE: ' + capsDir + ' ********************',
            '******************************************************************'
          ].join('\n')));
        } else {
          console.log(gutil.colors.blue(
            '********* PLUGIN TESTS SUCCEEDED: ' + capsDir + '**************'));
        }
        cb(err);
      });
  }
}

gulp.task('clean', function() {
  return gulp.src('./plugins')
    .pipe(clean())

});

gulp.task('clone-browserify-plugin', ['clean'], cloneTask(
  'https://github.com/jamestalmage/browserify-angular-test-utils.git',
  'plugins/browserify'
));
gulp.task('test-browserify-plugin', ['clone-browserify-plugin'],
  execTask('browserify'));

gulp.task('clone-gulp-plugin', ['clean'], cloneTask(
  'https://github.com/jamestalmage/gulp-angular-test-utils.git',
  'plugins/gulp'
));
gulp.task('test-gulp-plugin', ['clone-gulp-plugin'], execTask('gulp'));

gulp.task('clone-karma-plugin', ['clean'], cloneTask(
  'https://github.com/jamestalmage/karma-angular-test-utils.git',
  'plugins/karma'
));
gulp.task('test-karma-plugin', ['clone-karma-plugin'], execTask('karma'));

gulp.task('clone-plugins',
  ['clone-browserify-plugin', 'clone-karma-plugin', 'clone-gulp-plugin']);

// Conditionally build list of plugins to test.
// On Travis we use a matrix and test one plugin per run (for build stability).
// On Dev Machines we run all three plugins concurrently
var deps;
var pluginUnderTest = process.env.NGUTILS_PLUGIN;
if (pluginUnderTest) {
  pluginUnderTest = pluginUnderTest.toLowerCase();
  deps = ['test-' + pluginUnderTest + '-plugin'];
} else {
  deps = [
    'test-browserify-plugin',
    'test-gulp-plugin',
    'test-karma-plugin'
  ];
}
gulp.task('test-plugin', deps);

gulp.task('default', ['lint', 'check-style', 'test', 'test-example']);

gulp.task('test-example', function(cb) {
  processFiles({
    files: ['examples/messages-test.js'],
    base: 'examples',
    outputDir: 'build'
  });
  copySync(
    'examples/messages.js',
    'build/messages.js'
  );
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  });
});

function copySync(from, to) {
  fs.writeFileSync(to, fs.readFileSync(from));
}
