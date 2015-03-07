'use strict';

var hasAnnotation = require('../utils/hasAnnotation');

module.exports = createInjector;

var assert = require('assert');

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;

function createInjector (type, regexp, logger) {
  assert(typeof type === 'string', 'type must be a string');
  assert(regexp, 'regexp required');

  var needsInjection = require('./needsInjection')(regexp, logger);
  var buildInjection = require('./buildProviderCode');
  var collectVariableIdsAndInits = require('./collectVariableIdsAndInits');
  var hasNgProvideAnnotation = hasAnnotation(regexp);

  return addVariableInjections;

  function addVariableInjections (ast) {
    types.visit(ast, {
      visitVariableDeclaration: function(path) {
        var node = path.node;
        if (needsInjection(node)) {
          var obj = collectVariableIdsAndInits(type, node);

          var decl = b.variableDeclaration(
            'var',
            obj.ids.map(function(id) {
              return b.variableDeclarator(id, null);
            })
          );

          decl.comments = node.comments;

          path.replace(decl, buildInjection(obj.types, obj.ids, obj.inits));
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
          var injection = buildInjection(['value'], [node.left], [node.right]);
          injection.comments = parentNode.comments;
          parent.replace(injection);
        }
        return false;
      }
    });
    return ast;
  }
}
