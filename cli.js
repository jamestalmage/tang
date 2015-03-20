#!/usr/bin/env node

var parser = require('nomnom').script('ng-test-utils');

parser
  .command('transform')
  .options({
    files: {
      help: 'files to be transformed',
      position: 1,
      list: true,
      required: true
    },
    base: {
      help: 'base directory of sources',
      string: '-b BASE_DIR, --base=BASE_DIR',
      default: '.'
    },
    outputDir: {
      help: 'directory where to output files',
      string: '-o OUTPUT_DIR, --output=OUTPUT_DIR',
      required: true
    }
  })
  .callback(require('./processFiles'));

parser.nocommand().callback(printUsage);

parser.parse();

//TODO: Make this async so it sucks less

function printUsage() {
  console.log(parser.getUsage());
}
