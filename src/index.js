'use strict';

module.exports = transform;

var ngProvide = require('./ngProvide')(
  'value', /^\s*@ngProvide\s*$/, require('./silent-logger')
);

var ngValue = require('./ngProvide')(
  'value', /^\s*@ngValue\s*$/, require('./silent-logger')
);

var ngConstant = require('./ngProvide')(
  'constant', /^\s*@ngConstant\s*$/, require('./silent-logger')
);

var ngProvider = require('./ngProvide')(
  'provider',
  /^\s*@ngProvider\s*$/,
  require('./silent-logger'),
  null,
  function(name) {
    var returnValue =  name.replace(/Provider$/, '').toString();
    //console.log(name + ' replaced with ' + returnValue);
    return returnValue;
  }
);

var ngDirective = require('./ngProvide')(
  'directive', /^\s*@ngDirective\s*$/, require('./silent-logger'), '$compileProvider'
);

var replaceDirectiveController = require('./replaceDirectiveController').replace(
  /^\s*@replaceDirectiveController\s*$/
);

var proxyDirectiveController = require('./replaceDirectiveController').proxy(
  /^\s*@proxyDirectiveController\s*$/
);

var ngController = require('./replaceDirectiveController').controller(
  /^\s*@ngController\s*/
);

var ngFactory = require('./ngFactory')(/^\s*@ngFactory\s*$/);
var ngService = require('./ngService')(/^\s*@ngService\s*$/);

var ngInject = require('./ngInject')();

var ngInjectProvider = require('./ngInject')(
  /^\s*@ngInjectProvider\s*$/, require('./silent-logger'), 'module'
);

var recast = require('recast');
var convert = require('convert-source-map');
var merge = require('merge');

function transform(src, suppliedOptions) {
  var options = merge({
    readSourceMapComments:true,
    ngInject:true,
    ngProvide:true,
    ngValue:true,
    ngConstant:true,
    ngFactory:true,
    ngService:true,
    ngProvider:true,
    ngDirective:true,
    ngInjectProvider:true,
    replaceDirectiveController:true,
    mockDirectiveController:true,
    ngController:true
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
  if (options.ngFactory) {
    ngFactory(ast);
  }
  if (options.ngService) {
    ngService(ast);
  }
  if (options.ngProvider) {
    ngProvider(ast);
  }
  if (options.ngDirective) {
    ngDirective(ast);
  }
  if (options.ngInjectProvider) {
    ngInjectProvider(ast);
  }
  if (options.replaceDirectiveController) {
    replaceDirectiveController(ast);
  }
  if (options.mockDirectiveController) {
    proxyDirectiveController(ast);
  }
  if (options.ngController) {
    ngController(ast);
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
