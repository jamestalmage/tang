describe('ngConstant', function() {
  var lib = require('./lib');

  it('@ngConstant - provides a constant', function() {
    var input = [
      '// @ngConstant',
      'var a = "b";'
    ].join('\n');

    var expected = [
      '// @ngConstant',
      'var a;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = "b";',
      '    $provide.constant("a", a);',
      '  });',
      '});'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('@ngConstant - can be disabled', function() {
    var input = [
      '// @ngConstant',
      'var a = "b";'
    ].join('\n');

    expect(lib.process(input, {ngConstant:false}).code).to.equal(input);
  });
});
