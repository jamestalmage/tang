var types = require('ast-types');
var assert = require('assert');
var n = types.namedTypes;
var b = types.builders;

function beforeEachCall(callExp){
  n.CallExpression.assert(callExp);
  return b.callExpression(
    b.identifier('beforeEach'),
    [callExp]
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

module.exports = {
  injectCall: injectCall,
  beforeEachCall: beforeEachCall,
  assignmentStatements: assignmentStatements,
  assignmentStatement: assignmentStatement,
  wrapVariableId: wrapVariableId,
  wrapVariableIds: wrapVariableIds
};

