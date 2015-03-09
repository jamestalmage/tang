describe('ngProvider', function() {

  var lib = require('./lib');

  it('will generate a provider using object literal', function() {
    var input = [
      '// @ngProvider',
      'var myService = {',
      '  name: "world",',
      '  $get: function(a) {',
      '    return "hello " + this.name + a;',
      '  }',
      '}'
    ].join('\n');

    var expected = [
      '// @ngProvider',
      'var myService;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    myService = {',
      '      name: "world",',
      '      $get: function(a) {',
      '        return "hello " + this.name + a;',
      '      }',
      '    };',
      '',
      '    $provide.provider("myService", myService);',
      '  });',
      '});'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('will strip "Provider" suffix', function() {
    var input = [
      '// @ngProvider',
      'var myProviderEndProvider = {',
      '  name: "world",',
      '  $get: function(a) {',
      '    return "hello " + this.name + a;',
      '  }',
      '}'
    ].join('\n');

    var expected = [
      '// @ngProvider',
      'var myProviderEndProvider;', //only strips the last "Provider"
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    myProviderEndProvider = {',
      '      name: "world",',
      '      $get: function(a) {',
      '        return "hello " + this.name + a;',
      '      }',
      '    };',
      '',
      '    $provide.provider("myProviderEnd", myProviderEndProvider);',
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
