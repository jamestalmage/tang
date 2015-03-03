describe('ngInject - collect variable Ids', function() {
  var parse = require('../lib/parse');
  var _collectVariableIds = require('../../src/ngInject/collectVariableIds');

  function collectVariableIds(node){
    return  _collectVariableIds(node).ids.map(function(node){return node.name;});
  }

  it('a, b, c',function(){
    expect(collectVariableIds(parse('var a, b, c;').program.body[0]))
      .to.eql(['a','b','c']);
  });

  it('d',function(){
    expect(collectVariableIds(parse('var d;').program.body[0]))
      .to.eql(['d']);
  });

  it('e, f, g',function(){
    expect(collectVariableIds(parse('var e, f, g;').program.body[0]))
      .to.eql(['e','f','g']);
  });
});