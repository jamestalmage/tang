module.exports = transform;

var recast = require('recast');
var ngProvide = require('./ngProvide/index');
var ngInject = require('./ngInject');

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