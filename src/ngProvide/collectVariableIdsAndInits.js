module.exports = collectVariableIds;

var types = require('ast-types');
var n = types.namedTypes;

function collectVariableIds(node){
  n.VariableDeclaration.assert(node);
  var ids=[];
  var inits = [];
  types.visit(node,{
    visitVariableDeclarator:function(path){
      ids.push(path.node.id);
      inits.push(path.node.init);
      return false;
    }
  });
  return {ids:ids,inits:inits};
}