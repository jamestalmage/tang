describe('shared utils',function(){
  var lib = require('../lib');
  var s = require('../../src/utils/shared');

  it('variableDeclarations creates a list of declarations',function(){
    var ids = s.identifiers(['a','b','c']);
    var decl =s.variableDeclaration(ids);
    expect(lib.print(decl)).to.equal('var a, b, c;');
  });

});