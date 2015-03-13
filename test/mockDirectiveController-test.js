describe('interceptController', function() {

  var lib = require('./lib');

  it('blah', function() {
    var input = [
      '// @mockDirectiveController',
      'function myThing($scope) {',
      '  // do something',
      '}'
    ].join('\n');

    //jscs:disable
    var expected = [
      '// @mockDirectiveController',
      'var myThing = [];',
      '',
      'beforeEach(angular.mock.module(function($provide) {',
      '  $provide.decorator("myThingDirective", function($delegate) {',
      '    var directive = $delegate[0];',
      '    var $oldController = directive.controller;',
      '',
      '    var newController = function($scope) {',
      '      // do something',
      '    };',
      '',
      '    directive.controller = function($attrs, $element, $scope, $injector, $transclude) {',
      '      var locals = {',
      '        $attrs: $attrs,',
      '        $element: $element,',
      '        $scope: $scope,',
      '        $transclude: $transclude,',
      '        $oldController: $oldController,',
      '        $createOriginal: $createOriginal',
      '      };',
      '',
      '      function $createOriginal(extendedLocals) {',
      '        return $injector.instantiate($oldController, angular.extend({}, extendedLocals, locals));',
      '      }',
      '',
      '      var newInstance = $injector.instantiate(newController, locals);',
      '      myThing.push(newInstance);',
      '      return newInstance;',
      '    };',
      '',
      '    return $delegate;',
      '  });',
      '}));'
    ].join('\n');
    //jscs:enable

    expect(lib.process(input).code).to.equal(expected);
  });

  it('print it', function() {

    var input = [
      '// @mockDirectiveController',
      'function myThing($scope) {',
      '  // do something',
      '}'
    ].join('\n');

    console.log(lib.process(input).code);
  })
});
