module.exports = transform;

var recast = require('recast');
var insertVariableInjections = require('./insertVariableInjections');

function transform(src, opts){
  opts = opts || {};
  if(opts.sourceFileName && !opts.sourceMapName){
    opts.sourceMapName = opts.sourceFileName + '.map';
  }
  var ast = recast.parse(src, opts);
  insertVariableInjections(ast);
  return recast.print(ast, opts);
}