describe('interceptController', function() {

  var lib = require('./lib');

  it('injects code', function() {
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
      '      var self = this;',
      '      myThing.push(self);',
      '',
      '      var locals = {',
      '        $attrs: $attrs,',
      '        $element: $element,',
      '        $scope: $scope,',
      '        $transclude: $transclude,',
      '        $oldController: $oldController,',
      '        $super: $super',
      '      };',
      '',
      '      function $super(extendedLocals) {',
      '        return $injector.invoke($oldController, self, angular.extend({}, extendedLocals, locals));',
      '      }',
      '',
      '      $injector.invoke(newController, this, locals);',
      '    };',
      '',
      '    return $delegate;',
      '  });',
      '}));'
    ].join('\n');
    //jscs:enable

    expect(lib.process(input).code).to.equal(expected);
  });

  it('can be disabled', function() {

    var input = [
      '// @mockDirectiveController',
      'function myThing($scope) {',
      '  // do something',
      '}'
    ].join('\n');

    expect(lib.process(input, {mockDirectiveController:false}).code)
      .to.equal(input);
  });
});
