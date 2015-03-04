'use strict';

var hasAnnotation = require('../utils/hasAnnotation');

module.exports = createInjector();
module.exports.create = createInjector;

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;

function createInjector (regexp, logger) {

  regexp = regexp ||  /^\s*@ngProvide\s*$/;

  var needsInjection = require('./needsInjection').create(regexp, logger);
  var buildInjection = require('./buildProviderCode');
  var collectVariableIdsAndInits = require('./collectVariableIdsAndInits');
  var hasNgProvideAnnotation = hasAnnotation(regexp);

  return addVariableInjections;

  function addVariableInjections (ast) {
    types.visit(ast, {
      visitVariableDeclaration: function(path) {
        var node = path.node;
        if (needsInjection(node)) {
          var obj = collectVariableIdsAndInits(node);

          var decl = b.variableDeclaration(
            'var',
            obj.ids.map(function(id) {
              return b.variableDeclarator(id, null);
            })
          );

          decl.comments = node.comments;

          path.replace(decl, buildInjection(obj.ids, obj.inits));
        }
        return false;
      },
      visitAssignmentExpression: function(path) {
        var node = path.node;
        var parent = path.parent;
        var parentNode = parent && parent.node;
        if (
          parentNode &&
          n.ExpressionStatement.check(parentNode) &&
          hasNgProvideAnnotation(parentNode)
        ) {
          var injection = buildInjection([node.left], [node.right]);
          injection.comments = parentNode.comments;
          parent.replace(injection);
        }
        return false;
      }
    });
    return ast;
  }
}
