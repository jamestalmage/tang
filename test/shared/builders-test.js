'use strict';

describe('shared utils', function() {
  var lib = require('../lib');
  var s = require('../../src/builders');
  var types = require('recast').types;
  var n = types.namedTypes;
  var b = types.builders;

  it('provide("value",...) calls $provide.value()', function() {
    var pV = s.provide('value', b.literal('a'), b.literal('b'));
    var actual = lib.print(pV);

    var expected = '$provide.value("a", "b");';

    expect(actual).to.equal(expected);
  });

  it('moduleExp is expression that calls angular.mock.module', function() {
    var moduleName = b.literal('myModule');
    var moduleExp = s.moduleExp(moduleName);
    var actual = lib.print(moduleExp);

    var expected = 'angular.mock.module("myModule")';

    n.CallExpression.assert(moduleExp);
    expect(actual).to.equal(expected);
  });

  it('moduleStmt calls angular.mock.module', function() {
    var moduleName = b.literal('myModule');
    var moduleExp = s.moduleStmt(moduleName);
    var actual = lib.print(moduleExp);

    var expected = 'angular.mock.module("myModule");';

    n.ExpressionStatement.assert(moduleExp);
    expect(actual).to.equal(expected);
  });

  it('moduleStmt can take a function', function() {
    var fn = b.functionExpression(
      null,
      [],
      b.blockStatement([])
    );
    var actual = lib.print(s.moduleStmt(fn));

    var expected = 'angular.mock.module(function() {});';

    expect(actual).to.equal(expected);
  });

  it('moduleCb', function() {
    var moduleCb = s.moduleCb(
      [b.identifier('$provide')],
      [
        s.provide('value', b.literal('a'), b.literal('b')),
        s.provide('value', b.literal('c'), b.literal('d'))
      ]
    );
    var expected = [
      'angular.mock.module(function($provide) {',
      '  $provide.value("a", "b");',
      '  $provide.value("c", "d");',
      '});'
    ].join('\n');
    expect(lib.print(moduleCb)).to.equal(expected);
  });
});
