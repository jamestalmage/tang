var gulp = require('gulp');
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var spawnMocha = require('gulp-spawn-mocha');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var processFiles = require('./processFiles');
var karma = require('karma').server;
var fs = require('fs');
var del = require('del');
var lock = require('gulp-lock');

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

function spawnMochaTask(parser, cover) {
  return function() {
    var opt = {
      env: {NG_UTILS_PARSER: parser},
      growl: true,
      r: 'mocha-globals.js',
      colors: true
    };

    if (cover) {
      opt.istanbul = {
        dir: './coverage/' + parser,
        root: './src',
        report: 'none',
        print: 'none'
      };
    }

    return gulp.src(['test/**/*-test.js', 'test/*-test.js'], {read: false})
      .pipe(spawnMocha(opt))
      .on('error', gutil.log);
  };
}

var testTaskDeps = [];
var coverTaskDeps = [];

var parsers = ['recast', 'esprima', 'acorn'];

parsers.forEach(function(parser) {
  var lintAndStyle = ['lint', 'check-style'];
  var testName = 'test-' + parser;
  var coverName = 'cover-' + parser;
  gulp.task(testName, lintAndStyle, spawnMochaTask(parser, false));
  gulp.task(coverName, lintAndStyle, spawnMochaTask(parser, true));
  testTaskDeps.push(testName);
  coverTaskDeps.push(coverName);
});

gulp.task('test', testTaskDeps);

gulp.task('cover', coverTaskDeps, function(cb) {
  //combine all the coverage reports
  var istanbul = require('istanbul');
  var collector = new istanbul.Collector();
  var reporter = new istanbul.Reporter();
  var sync = false;

  parsers.forEach(function(parser) {
    collector.add(require('./coverage/' + parser + '/coverage.json'));
  });

  reporter.add('text');
  reporter.addAll(['lcov', 'clover']);
  reporter.write(collector, sync, cb);
});

gulp.task('watch', function() {
  gulp.watch(['test/**', 'src/**'], ['test']);
});

var cloneLock = process.env.TRAVIS ? lock() : lock.unlimited;
var execLock = process.env.TRAVIS ? lock() : lock.unlimited;

function cloneTask(url, dir) {
  return cloneLock.cb(function(cb) {
    exec('mkdir -p plugins && git clone --depth 1 ' + url + ' ' + dir,
      function(err, stdout, stderr) {
        if (err) {
          console.log(stdout);
          console.log(stderr);
        }
        cb(err);
      }
    );
  });
}

function execTask(dir) {
  return execLock.cb(function(cb) {
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
  });
}

gulp.task('clean', function(cb) {
  del(['./plugins'], cb);
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

gulp.task('default', ['cover', 'test-example', 'test-plugin']);

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
  }, cb);
});

function copySync(from, to) {
  fs.writeFileSync(to, fs.readFileSync(from));
}
