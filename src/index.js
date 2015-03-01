module.exports = transform;

var recast = require('recast');
var ngProvide = require('./ngProvide/insertProviders');
var ngInject = require('./ngInject/insertVariableInjections');

function transform(src, opts){
  opts = opts || {};
  if(opts.sourceFileName && !opts.sourceMapName){
    opts.sourceMapName = opts.sourceFileName + '.map';
  }
  opts.inputSourceMap = opts.inputSourceMap || null;
  var doNgInject = opts.hasOwnProperty('ngInject') ? opts.ngInject : true;
  var doNgProvide = opts.hasOwnProperty('ngProvide') ? opts.ngProvide : true;
  var ast = recast.parse(src, opts);
  if(doNgProvide) ngProvide(ast);
  if(doNgInject) ngInject(ast);
  return recast.print(ast, opts);
}