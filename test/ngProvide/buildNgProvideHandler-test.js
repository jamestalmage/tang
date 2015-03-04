describe('ngProvide - build handler code', function() {
  var lib = require('../lib');
  var buildNgProvider = require('../../src/ngProvide/buildProviderCode');
  var types = require('recast').types;
  var n = types.namedTypes;
  var b = types.builders;

  it('builds the before each call', function() {
    var ngProvideInit = buildNgProvider(
      [b.identifier('a')],
      [b.literal('b')]
    );

    var code = [
      'beforeEach(function() {',
      '    angular.mock.module(function($provide) {',
      '        a = "b";',
      '        $provide.value("a", a);',
      '    });',
      '});'
    ].join('\n');

    expect(lib.print(ngProvideInit)).to.equal(code);
  });
});
