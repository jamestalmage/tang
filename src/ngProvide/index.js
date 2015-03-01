module.exports = transform;

var recast = require('recast');
var insertProviders = require('./insertProviders');

function transform(src, opts){
  opts = opts || {};
  if(opts.sourceFileName && !opts.sourceMapName){
    opts.sourceMapName = opts.sourceFileName + '.map';
  }
  opts.inputSourceMap = opts.inputSourceMap || null;
  var ast = recast.parse(src, opts);
  insertProviders(ast);
  return recast.print(ast, opts);
}