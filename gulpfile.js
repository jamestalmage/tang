var gulp = require('gulp');
//var git = require('nodegit');
//var clone = git.Clone.clone;
var exec = require('child_process').exec;
var clean = require('gulp-clean');
var gutils = require('gulp-util');


/*function cloneTask(url, dir){
  var opts = { ignoreCertErrors: 1, depth:1 }
  return function(cb){
    clone(url, dir, opts)
      .then(function(repo){
        cb();
      })
      .catch(cb);
  }
}*/

function cloneTask(url, dir){
  return function(cb){
    exec('mkdir -p plugins && git clone ' + url + ' ' + dir, function(err, stdout, stderr) {
      if(err){
        console.log(stdout);
        console.log(stderr);
      }
      cb(err);
    });
  }
}


function execTask(dir){
  return function(cb){
    exec('cd ./plugins/' + dir + ' && npm i && npm i ../.. && gulp', function(err,stdout,stderr){
        var capsDir = dir.toUpperCase();
      if(err){
        console.log(gutils.colors.red([
          '************************************************************************************************',
          '***************************** BEGIN FAILURE: ' + capsDir + ' ***************************************'
        ].join('\n')));

        console.log(stdout);
        console.log(stderr);

        console.log(gutils.colors.red([
          '***************************** END FAILURE: ' + capsDir + ' *****************************************',
          '************************************************************************************************'
        ].join('\n')));
      }
      else {
        console.log(gutils.colors.blue('************** PLUGIN TESTS SUCCEEDED: ' + capsDir + '***************************'));
      }
      cb(err);
    });
  }
}

gulp.task('clean',function(){
  return gulp.src('./plugins')
    .pipe(clean())

});

gulp.task('clone-browserify',['clean'],cloneTask(
  'https://github.com/jamestalmage/browserify-angular-test-utils.git',
  'plugins/browserify'
));

gulp.task('run-browserify',['clone-browserify'],execTask('browserify'));

gulp.task('clone-gulp',['clean'],cloneTask(
  'https://github.com/jamestalmage/gulp-angular-test-utils.git',
  'plugins/gulp'
));
gulp.task('run-gulp',['clone-gulp'],execTask('gulp'));

gulp.task('clone-karma',['clean'],cloneTask(
  'https://github.com/jamestalmage/karma-angular-test-utils.git',
  'plugins/karma'
));
gulp.task('run-karma',['clone-karma'],execTask('karma'));

gulp.task('clone', ['clone-browserify', 'clone-karma', 'clone-gulp']);

gulp.task('default', ['run-browserify','run-karma','run-gulp']);