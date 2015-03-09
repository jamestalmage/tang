describe('@ngDirective', function() {

  var lib = require('./lib');

  it('will inject a directive', function() {
    var input = [
      '// @ngDirective',
      'function myDirective($timeout, $log) {',
      '  return {',
      '    template: "<div></div>",',
      '    link: function postLink(scope, iElement, iAttrs, controller) {',
      '      // do stuff',
      '    }',
      '  };',
      '}'
    ].join('\n');

    var expected = [
      '// @ngDirective',
      'var myDirective;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($compileProvider) {',
      '    myDirective = function($timeout, $log) {',
      '      return {',
      '        template: "<div></div>",',
      '        link: function postLink(scope, iElement, iAttrs, controller) {',
      '          // do stuff',
      '        }',
      '      };',
      '    };',
      '',
      '    $compileProvider.directive("myDirective", myDirective);',
      '  });',
      '});'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('can be turned off', function() {
    var input = [
      '// @ngDirective',
      'function myDirective($timeout, $log) {',
      '  return {',
      '    template: "<div></div>",',
      '    link: function postLink(scope, iElement, iAttrs, controller) {',
      '      // do stuff',
      '    }',
      '  };',
      '}'
    ].join('\n');

    expect(lib.process(input, {ngDirective:false}).code).to.equal(input)
  });
});
