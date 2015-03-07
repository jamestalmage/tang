'use strict';

module.exports = transform;

var recast = require('recast');
var ngProvide = require('./ngProvide/index')(
  'value', /^\s*@ngProvide\s*$/, require('./silent-logger')
);
var ngValue = require('./ngProvide/index')(
  'value', /^\s*@ngValue\s*$/, require('./silent-logger')
);
var ngConstant = require('./ngProvide/index')(
  'constant', /^\s*@ngConstant\s*$/, require('./silent-logger')
);
var ngInject = require('./ngInject');
var convert = require('convert-source-map');
var merge = require('merge');

function transform(src, suppliedOptions) {
  var options = merge({
    readSourceMapComments:true,
    ngInject:true,
    ngProvide:true,
    ngValue:true,
    ngConstant:true
  }, suppliedOptions);
  if (options.sourceMap) {
    if (options.sourceFileName && !options.sourceMapName) {
      options.sourceMapName = options.sourceFileName + '.map';
    }
    if (!options.inputSourceMap && options.readSourceMapComments) {
      var inputMap = convert.fromSource(src);
      if (inputMap) {
        options.inputSourceMap = inputMap.toObject();
      }
    }
  } else {
    delete options.sourceFileName;
  }
  var ast = recast.parse(src, options);
  if (options.ngProvide) {
    ngProvide(ast);
  }
  if (options.ngValue) {
    ngValue(ast);
  }
  if (options.ngInject) {
    ngInject(ast);
  }
  if (options.ngConstant) {
    ngConstant(ast);
  }
  var result = recast.print(ast, options);
  var transformedCode = result.code;
  var map = null;
  if (options.sourceMap) {
    map = result.map;
    if (result.map && options.appendSourceMapComment) {
      transformedCode = convert.removeComments(transformedCode);
      map = convert.fromObject(result.map);
      transformedCode += '\n' + map.toComment() + '\n';
    }
  }
  return {
    code: transformedCode,
    map: map
  };
}
