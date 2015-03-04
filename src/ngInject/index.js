module.exports = createInjector();
module.exports.create = createInjector;

var types = require('recast').types;
var n = types.namedTypes;
var s = require('../utils/builders');

function createInjector(regexp, logger) {
  var needsInjection = require('./needsInjection').create(regexp, logger);
  var collectVariableIds = require('./collectVariableIds');

  return addVariableInjections;

  function addVariableInjections(ast) {
    types.visit(ast, {
      visitVariableDeclaration: function(path) {
        var node = path.node;
        if (needsInjection(node)) {
          var obj = collectVariableIds(node);

          // variable declaration
          var decl = s.variableDeclaration(obj.ids);
          decl.comments = node.comments;

          // beforeEach call that injects required variables and assigns them.
          var beforeEach = s.beforeEachStmt([
            s.injectCall(obj.inject, obj.assign)
          ]);

          path.replace(decl, beforeEach);
        }
        return false;
      }
    });
    return ast;
  }
}
