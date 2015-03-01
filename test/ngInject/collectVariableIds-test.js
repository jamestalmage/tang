describe('collectVariableIds', function() {
  var parse = require('../lib/parse');
  var collectVariableIds = require('../../src/ngInject/collectVariableIds');

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