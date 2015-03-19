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
var _ = require('lodash');

gulp.task('lint', function() {
  return gulp.src(['src/**', 'test/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs());
});

function spawnMochaTask(parser, cover) {
  return function() {
    var opt = {
      env: {NG_UTILS_PARSER: parser},
      growl: true,
      r: 'mocha-globals.js',
      reporter:'dot',
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

var testTaskDeps = ['lint'];
var coverTaskDeps = ['lint'];

var parsers = ['recast', 'esprima', 'acorn'];

parsers.forEach(function(parser) {
  var testName = 'test-' + parser;
  var coverName = 'cover-' + parser;
  gulp.task(testName, spawnMochaTask(parser, false));
  gulp.task(coverName, spawnMochaTask(parser, true));
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
    var capsDir = dir.toUpperCase();
    logLines('blue','STARTING PLUGIN TEST: ' + capsDir);
    exec('cd ./plugins/' + dir + ' && npm i && npm i ../.. && gulp',
      function(err, stdout, stderr) {
        if (err) {
          logLines('red', '', 'BEGIN FAILURE: ' + capsDir);
          console.log(stdout);
          console.log(stderr);
          logLines('red', 'END FAILURE: ' + capsDir, '');
        } else {
          logLines('blue', 'PLUGIN TEST SUCCEEDED: ' + capsDir);
        }
        cb(err);
      });
  });
}

function logLines(color, var_message){
  console.log(messageLines.apply(null, arguments));
}

function messageLines(color, var_message){
  var lines = Array.prototype.slice.call(arguments, 1);
  return gutil.colors[color](lines.map(message).join('\n'));
}

function message(message) {
  message = message || '';
  var len = Math.floor((80 - message.length) / 2);
  var pad = new Array(len).join('*');
  return pad + ' ' + message + ' ' + pad;
}

gulp.task('clean', function(cb) {
  del(['./plugins'], cb);
});

var deps = [];

_.forEach({
  browserify: 'https://github.com/jamestalmage/browserify-angular-test-utils.git',
  gulp: 'https://github.com/jamestalmage/gulp-angular-test-utils.git',
  karma: 'https://github.com/jamestalmage/karma-angular-test-utils.git'
}, function(url, key) {
  var test = 'test-' + key + '-plugin';
  var clone = 'clone-' + key + '-plugin';

  gulp.task(clone, ['clean'], cloneTask(url, 'plugins/' + key));
  gulp.task(test, [clone], execTask(key));
  deps.push(test);
});

gulp.task('test-plugin', deps);

gulp.task('default', ['cover', 'test-example', 'test-plugin'], function() {
  console.log('build successful');
});

gulp.task('test-example', function(cb) {
  processFiles({
    files: ['examples/messages-test.js', 'examples/*-example.js'],
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
