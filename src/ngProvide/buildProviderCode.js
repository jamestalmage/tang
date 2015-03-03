module.exports = buildNgProvide;

var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;
var s = require('../utils/builders');
var assert = require('assert');

function buildNgProvide(ids, inits){
  assert.equal(ids.length, inits.length, 'ids and inits must be same length');

  var assignments = [];
  var provides = [];

  for (var i = 0; i < ids.length; i++) {
    assignments.push(
      s.assignmentStatement(ids[i],inits[i])
    );
    provides.push(
      s.provideValue(b.literal(ids[i].name),ids[i])
    );
  }
  var func= b.functionExpression(
    null,
     [b.identifier('$provide')],
    b.blockStatement(

      assignments.concat(provides)
    )
  );

  var moduleStmt = s.moduleStmt(func );

  return s.beforeEachStmt(
   [ b.functionExpression(null,[], b.blockStatement([ moduleStmt]))]
  );
}
