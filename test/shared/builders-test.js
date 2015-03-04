describe('shared utils', function() {
  var lib = require('../lib');
  var s = require('../../src/utils/builders');
  var types = require('recast').types;
  var n = types.namedTypes;
  var b = types.builders;

  it('variableDeclarations creates a list of declarations', function() {
    var ids = s.identifiers(['a', 'b', 'c']);
    var actual = lib.print(s.variableDeclaration(ids));

    var expected = 'var a, b, c;';

    expect(actual).to.equal(expected);
  });

  it('provideValue calls $provide.value()', function() {
    var pV = s.provideValue(b.literal('a'), b.literal('b'));
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
        s.provideValue(b.literal('a'), b.literal('b')),
        s.provideValue(b.literal('c'), b.literal('d'))
      ]
    );
    var expected = [
      'angular.mock.module(function($provide) {',
      '    $provide.value("a", "b");',
      '    $provide.value("c", "d");',
      '});'
    ].join('\n');
    expect(lib.print(moduleCb)).to.equal(expected);
  });
});
