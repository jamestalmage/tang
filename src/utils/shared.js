var types = require('ast-types');
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

function assignmentStatements(lhs, rhs, array){
  assert.equal(lhs.length, rhs.length, 'lhs and rhs must have matching lengths');
  array = array || [];
  for(var i = 0; i < lhs.length; i++){
    array.push(assignmentStatement(lhs[i],rhs[i]));
  }
  return array;
}

function assignmentStatement(lhs, rhs){
  return b.expressionStatement(b.assignmentExpression('=',lhs,rhs));
}

function wrapVariableId(id){
  return '_' + id + '_';
}

function wrapVariableIds(ids){
  return ids.map(wrapVariableId);
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
  assignmentStatements: assignmentStatements,
  assignmentStatement: assignmentStatement,
  wrapVariableId: wrapVariableId,
  wrapVariableIds: wrapVariableIds,
  variableDeclaration: variableDeclaration,
  identifiers: identifiers,
  provideValue: provideValue,
  moduleExp: moduleExp,
  moduleStmt: moduleStmt,
  moduleCb: moduleCb
};

