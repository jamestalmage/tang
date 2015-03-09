describe('ngProvide', function() {

  var lib = require('./lib');

  it('will generate a provider using object literal', function() {
    var input = [
      '// @ngProvider',
      'var myProvider = {',
      '  name: "world",',
      '  $get: function(a) {',
      '    return "hello " + this.name + a;',
      '  }',
      '}'
    ].join('\n');

    var expected = [
      '// @ngProvider',
      'var myProvider;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    myProvider = {',
      '      name: "world",',
      '      $get: function(a) {',
      '        return "hello " + this.name + a;',
      '      }',
      '    };',
      '',
      '    $provide.provider("myProvider", myProvider);',
      '  });',
      '});'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('can be turned off', function() {
    var input = [
      '// @ngProvider',
      'var myProvider = {',
      '  name: "world",',
      '  $get: function(a) {',
      '    return "hello " + this.name + a;',
      '  }',
      '}'
    ].join('\n');

    expect(lib.process(input, {ngProvider:false}).code).to.equal(input);
  });
});
