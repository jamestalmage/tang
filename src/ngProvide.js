'use strict';

var hasAnnotation = require('./utils/hasAnnotation');

module.exports = createInjector;

var assert = require('assert');

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var s = require('./utils/builders');

function createInjector (type, regexp, logger) {
  assert(typeof type === 'string', 'type must be a string');
  assert(regexp, 'regexp required');

  var hasNgProvideAnnotation = hasAnnotation(regexp);

  return addVariableInjections;

  function addVariableInjections (ast) {
    types.visit(ast, {
      visitVariableDeclaration: function(path) {
        var node = path.node;

        // check that this is a node we want to modify
        if (!hasNgProvideAnnotation(node)) {
          logger.logRejectedNode('does not contain an NgProvide comment', node);
          return false;
        }
        if (missingInit(node)) {
          //TODO: throw here?
          logger.logRejectedNode('variable missing initialization', node);
          return false;
        }
        logger.logAcceptedNode(node);

        var obj = collectVariableIdsAndInits(type, node);
        var decl = b.variableDeclaration(
          'var',
          obj.ids.map(function(id) {
            return b.variableDeclarator(id, null);
          })
        );

        decl.comments = node.comments;

        path.replace(decl, buildInjection(obj.types, obj.ids, obj.inits));
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

function missingInit(node) {
  n.VariableDeclaration.assert(node);
  var missing = false;
  types.visit(node, {
    visitVariableDeclarator:function(path) {
      var node = path.node;
      if (node.init === null || node.init === undefined) {
        missing = true;
      }
      return false;
    }
  });
  return missing;
}

function collectVariableIdsAndInits(type, node) {
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

function buildInjection(types, ids, inits) {
  assert.equal(ids.length, inits.length, 'ids and inits must be same length');
  assert.equal(types.length, inits.length, 'types.length !== inits.length');

  var assignments = [];
  var provides = [];

  for (var i = 0; i < ids.length; i++) {
    assignments.push(s.assignmentStatement(ids[i], inits[i]));

    provides.push(s.provide(types[i], b.literal(ids[i].name), ids[i]));
  }

  var moduleStmt = s.moduleCb(
    [b.identifier('$provide')],
    assignments.concat(provides)
  );

  return s.beforeEachStmt(
    [b.functionExpression(null, [], b.blockStatement([moduleStmt]))]
  );
}
