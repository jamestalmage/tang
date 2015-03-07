'use strict';

module.exports = collectVariableIds;

var types = require('recast').types;
var n = types.namedTypes;

function collectVariableIds(type, node) {
  n.VariableDeclaration.assert(node);
  var t = [];
  var ids = [];
  var inits = [];
  types.visit(node, {
    visitVariableDeclarator:function(path) {
      t.push(type);
      ids.push(path.node.id);
      inits.push(path.node.init);
      return false;
    }
  });
  return {types:t, ids:ids, inits:inits};
}
