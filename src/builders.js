'use strict';

var types = require('recast').types;
var assert = require('assert');
var n = types.namedTypes;
var b = types.builders;

function sliceArgs(args) {
  return Array.prototype.slice.call(args);
}

function beforeEachStmt(args) {
  return b.expressionStatement(
    b.callExpression(
      b.identifier('beforeEach'),
      args
    )
  );
}

function injectCall(params, statements, ngFuncName) {
  return b.callExpression(
    b.identifier(ngFuncName),
    [
      b.functionExpression(null, params, b.blockStatement(statements))
    ]
  );
}

function assignmentStatement(lhs, rhs) {
  return b.expressionStatement(b.assignmentExpression('=', lhs, rhs));
}

function variableDeclaration(ids) {
  return b.variableDeclaration(
    'var',
    ids.map(function(id) {
      return b.variableDeclarator(id, null);
    })
  );
}

function provide(type, id, val, $provide) {
  n.Literal.assert(id);
  $provide = $provide || '$provide';

  var $parseValueExp = b.memberExpression(
    b.identifier($provide),
    b.identifier(type),
    false
  );

  return b.expressionStatement(
    b.callExpression(
      $parseValueExp,
      [id, val]
    )
  );
}

function moduleStmt() {
  return b.expressionStatement(
    moduleExp.apply(null, sliceArgs(arguments))
  );
}

function moduleExp() {
  var mockModule = b.memberExpression(
    b.memberExpression(
      b.identifier('angular'),
      b.identifier('mock'),
      false
    ),
    b.identifier('module'),
    false
  );

  return b.callExpression(
      mockModule,
      sliceArgs(arguments)
  );
}

function moduleCb(params, stmts) {
  var functionExp = b.functionExpression(
    null,
    params,
    b.blockStatement(stmts)
  );

  return moduleStmt(functionExp);
}

module.exports = {
  injectCall: injectCall,
  beforeEachStmt: beforeEachStmt,
  assignmentStatement: assignmentStatement,
  variableDeclaration: variableDeclaration,
  provide: provide,
  moduleExp: moduleExp,
  moduleStmt: moduleStmt,
  moduleCb: moduleCb
};
