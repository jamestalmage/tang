'use strict';

module.exports = buildNgProvide;

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var s = require('../utils/builders');
var assert = require('assert');

function buildNgProvide(types, ids, inits) {
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
