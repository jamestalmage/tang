describe('ngProvide - perform ast transformation', function() {
  var util = require('../lib');
  var insertVariableInjections = require('../../src/ngProvide/index');

  it('inserts a beforeEach', function() {
    var input = util.parse([
      'var c, d;',
      '// @ngProvide',
      'var a=sinon.spy(), b=sinon.spy();'
    ]);
    var output = util.print(insertVariableInjections(input));

    var expected = [
      'var c, d;',
      '',
      '// @ngProvide',
      'var a, b;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = sinon.spy();',
      '    b = sinon.spy();',
      '    $provide.value("a", a);',
      '    $provide.value("b", b);',
      '  });',
      '});'
    ].join('\n');

    expect(output).to.equal(expected);
  });
});
