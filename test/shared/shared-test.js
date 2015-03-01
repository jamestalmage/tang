describe('shared utils',function(){
  var lib = require('../lib');
  var s = require('../../src/utils/shared');
  var types = require('ast-types');
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

});