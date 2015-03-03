describe('shared utils',function(){
  var lib = require('../lib');
  var s = require('../../src/utils/builders');
  var types = require('recast').types;
  var n = types.namedTypes;
  var b = types.builders;

  it('variableDeclarations creates a list of declarations',function(){
    var ids = s.identifiers(['a','b','c']);
    var decl = s.variableDeclaration(ids);
    expect(lib.print(decl)).to.equal('var a, b, c;');
  });

  it('provideValue calls $provide.value()',function(){
    var a = b.literal('a');
    var _b = b.literal('b');

    var pV = s.provideValue(a,_b);
    expect(lib.print(pV)).to.equal('$provide.value("a", "b");');
  });

  it('moduleExp returns an expression that calls angular.mock.module', function() {
    var moduleName = b.literal('myModule');
    var moduleExp = s.moduleExp(moduleName);
    n.CallExpression.assert(moduleExp);
    expect(lib.print(moduleExp)).to.equal('angular.mock.module("myModule")');
  });

  it('moduleStmt returns a statement that calls angular.mock.module', function() {
    var moduleName = b.literal('myModule');
    var moduleExp = s.moduleStmt(moduleName);
    n.ExpressionStatement.assert(moduleExp);
    expect(lib.print(moduleExp)).to.equal('angular.mock.module("myModule");');
  });

  it('moduleStmt can take a function', function() {
    var fn = b.functionExpression(
      null,
      [],
      b.blockStatement([])
    );
    var moduleExp = s.moduleStmt(fn);
    expect(lib.print(moduleExp)).to.equal('angular.mock.module(function() {});');
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
      "angular.mock.module(function($provide) {",
      "    $provide.value(\"a\", \"b\");",
      "    $provide.value(\"c\", \"d\");",
      "});"
    ].join("\n");
    expect(lib.print(moduleCb)).to.equal(expected);
  });
});