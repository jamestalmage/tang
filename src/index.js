module.exports = transform;

var recast = require('recast');
var ngProvide = require('./ngProvide/index');
var ngInject = require('./ngInject');
var convert = require('convert-source-map');

function transform(src, suppliedOptions){
  var options = {};
  suppliedOptions = suppliedOptions || {};
  if(suppliedOptions.sourceFileName) options.sourceFileName = suppliedOptions.sourceFileName;
  if(suppliedOptions.sourceFileName && !suppliedOptions.sourceMapName){
    options.sourceMapName = suppliedOptions.sourceFileName + '.map';
  }
  if(suppliedOptions.inputSourceMap){
    options.inputSourceMap = suppliedOptions.inputSourceMap;
  } else if(suppliedOptions.readSourceMapComments !== false) {
    var inputMap = convert.fromSource(src);
    if(inputMap) options.inputSourceMap = inputMap.toObject();
  }
  var doNgInject = suppliedOptions.hasOwnProperty('ngInject') ? suppliedOptions.ngInject : true;
  var doNgProvide = suppliedOptions.hasOwnProperty('ngProvide') ? suppliedOptions.ngProvide : true;
  var ast = recast.parse(src, options);
  if(doNgProvide) ngProvide(ast);
  if(doNgInject) ngInject(ast);
  var result = recast.print(ast, options);
  var transformedCode = result.code;
  var map = result.map;
  if(map && suppliedOptions.appendSourceMapComment){
    transformedCode = convert.removeComments(transformedCode);
    transformedCode += '\n' + convert.fromObject(map).toComment() + '\n';
  }
  return {
    code: transformedCode,
    map: map
  };
}