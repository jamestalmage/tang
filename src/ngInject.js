'use strict';

module.exports = createInjector;
module.exports.collectVariableIds = collectVariableIds;
module.exports.needsInjection = needsInjection;
module.exports.requiredInjection = requiredInjection;

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var s = require('./builders');

function createInjector(regexp, logger, injectionFuncName) {
  regexp = regexp ||  /^\s*@ngInject\s*$/;
  logger = logger || require('./silent-logger');
  injectionFuncName = injectionFuncName || 'inject';

  var injectionNeeded = needsInjection(regexp, logger);

  return addVariableInjections;

  function addVariableInjections(ast) {
    types.visit(ast, {
      visitVariableDeclaration: function(path) {
        var node = path.node;

        if (!injectionNeeded(node)) {
          return false;
        }

        var obj = collectVariableIds(node);

        // variable declaration
        var decl = s.variableDeclaration(obj.ids);
        decl.comments = node.comments;

        // beforeEach call that injects required variables and assigns them.
        var beforeEach = s.beforeEachStmt([
          s.injectCall(obj.inject, obj.assign, injectionFuncName)
        ]);

        path.replace(decl, beforeEach);
        return false;
      }
    });
    return ast;
  }
}

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

function needsInjection(regexp, logger) {
  var containsNgInjectAnnotation = require('./hasAnnotation')(regexp);

  return function(node) {
    if (!n.VariableDeclaration.check(node)) {
      logger.logRejectedNode('not a VariableDeclaration', node);
      return false;
    }
    if (!containsNgInjectAnnotation(node)) {
      logger.logRejectedNode('does not contain an NgInit comment', node);
      return false;
    }
    if (hasNonInjectableInit(node)) {
      logger.logRejectedNode('contains a variable initialization', node);
      return false;
    }
    logger.logAcceptedNode(node);
    return true;
  };

  function hasNonInjectableInit(node) {
    n.VariableDeclaration.assert(node);
    var found = false;
    types.visit(node, {
      visitVariableDeclarator:function(path) {
        var init = path.node.init;
        if (init !== null) {
          found = found || (requiredInjection(init) === null);
        }
        return false;
      }
    });
    return found;
  }
}

function requiredInjection(node) {
  if (n.Identifier.check(node)) {
    return node.name;
  }
  if (n.MemberExpression.check(node)) {
    return requiredInjection(node.object);
  }
  if (n.CallExpression.check(node)) {
    return requiredInjection(node.callee);
  }
  return null;
}
