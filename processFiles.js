module.exports = processFiles;

var fs = require('fs');
var merge = require('merge');
var path = require('path');
var mkpath = require('mkpath');
var transform = require('./index');
var glob = require('glob');

function processFiles(opts) {
  opts.files = opts.files.reduce(function(files, pattern) {
    if(glob.hasMagic(pattern)){
      var newFiles = glob.sync(pattern);
      files.push.apply(files, newFiles);
    }
    else {
      files.push(pattern)
    }
    return files;
  },[]);

  opts.files.forEach(function(inputPath) {
    inputPath = path.resolve(inputPath);

    var outputPath = path.resolve(
      opts.outputDir,
      path.relative(opts.base, inputPath)
    );

    var fileOpts = merge({}, opts, {
      sourceFileName: inputPath,
      appendSourceMapComment: true
    });

    console.log('reading: %s', inputPath);

    if (fs.statSync(inputPath).isDirectory()) {
      return;
    }

    var inputCode = fs.readFileSync(inputPath);

    var transformedCode = transform(inputCode, fileOpts).code;

    var d = path.dirname(outputPath);
    console.log('mkpath: %s', d);
    mkpath.sync(d);

    fs.writeFileSync(outputPath, transformedCode);
  });
}
