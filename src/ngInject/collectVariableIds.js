module.exports = collectVariableIds;

var types = require('ast-types');
var n = types.namedTypes;

function collectVariableIds(node){
  n.VariableDeclaration.assert(node);
  var ids=[];
  types.visit(node,{
    visitIdentifier:function(path){
      ids.push(path.node.name);
      return false;
    }
  });
  return ids;
}