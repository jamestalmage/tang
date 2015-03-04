'use strict';

module.exports = collectVariableIds;

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var requiredInjection = require('../utils/requiredInjection');
var s = require('../utils/builders');

function collectVariableIds(node) {
  n.VariableDeclaration.assert(node);
  var injectedOrSet = {};
  var ids = [];
  var inject = [];
  var assign = [];

  types.visit(node, {
    visitVariableDeclarator:function(path) {
      var node = path.node;
      if (node.init) {
        var req = requiredInjection(node.init);
        var reqId = b.identifier(req);
        if (injectedOrSet[req] !== true) {
          injectedOrSet[req] = true;
          inject.push(reqId);
        }
        ids.push(node.id);
        injectedOrSet[node.id.name] = true;
        assign.push(s.assignmentStatement(node.id, node.init));
      } else {
        ids.push(node.id);
        var name = node.id.name;
        var injectionName = '_' + name + '_';
        injectedOrSet[name] = true;
        var injectId = b.identifier(injectionName);
        inject.push(injectId);
        assign.push(s.assignmentStatement(node.id, injectId));
      }
      return false;
    }
  });
  return {ids:ids, inject:inject, assign:assign};
}
