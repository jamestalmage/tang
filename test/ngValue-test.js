describe('ngValue', function() {
  var lib = require('./lib');

  it('@ngValue - provides a value', function() {
    var input = [
      '// @ngValue',
      'var a = "a";'
    ].join('\n');

    var expected = [
      '// @ngValue',
      'var a;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = "a";',
      '    $provide.value("a", a);',
      '  });',
      '});'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('@ngValue - can be disabled', function() {
    var input = [
      '// @ngValue',
      'var a = "b";'
    ].join('\n');

    expect(lib.process(input, {ngValue:false}).code).to.equal(input);
  });
});
