var types = require('recast').types;
var assert = require('assert');
var n = types.namedTypes;
var b = types.builders;

function sliceArgs(args){
  return Array.prototype.slice.call(args);
}

function beforeEachStmt(stmts){
  return b.expressionStatement(
    beforeEachExp(stmts)
  );
}

function beforeEachExp(args){
  return b.callExpression(
    b.identifier('beforeEach'),
    args
  );
}

function injectCall(params, statements){
  return b.callExpression(
    b.identifier('inject'),
    [
      b.functionExpression( null, params, b.blockStatement(statements))
    ]
  );
}

function assignmentStatement(lhs, rhs){
  return b.expressionStatement(b.assignmentExpression('=',lhs,rhs));
}

function variableDeclaration(ids){
  return b.variableDeclaration(
    'var',
    ids.map(function(id){
      return b.variableDeclarator(id, null);
    })
  );
}

function provideValue(id, val){
  n.Literal.assert(id);

  var $parse_value = b.memberExpression(
    b.identifier('$provide'),
    b.identifier('value'),
    false
  );

  return b.expressionStatement(
    b.callExpression(
      $parse_value,
      [ id, val ]
    )
  );
}

function moduleStmt() {
  return b.expressionStatement(
    moduleExp.apply(null,sliceArgs(arguments))
  );
}

function moduleExp() {
  var angular_mock__module = b.memberExpression(
    b.memberExpression(
      b.identifier('angular'),
      b.identifier('mock'),
      false
    ),
    b.identifier('module'),
    false
  );

  return b.callExpression(
      angular_mock__module,
      sliceArgs(arguments)
  );
}

function moduleCb(params,stmts) {
  var functionExp = b.functionExpression(
    null,
    params,
    b.blockStatement(stmts)
  );

  return moduleStmt(functionExp);
}

function identifiers(ids){
  return ids.map(b.identifier.bind(b));
}

module.exports = {
  injectCall: injectCall,
  beforeEachCall: beforeEachExp,
  beforeEachStmt: beforeEachStmt,
  assignmentStatement: assignmentStatement,
  variableDeclaration: variableDeclaration,
  identifiers: identifiers,
  provideValue: provideValue,
  moduleExp: moduleExp,
  moduleStmt: moduleStmt,
  moduleCb: moduleCb
};

