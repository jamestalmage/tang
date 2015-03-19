describe('interceptController', function() {
  it('injects code', function() {
    var input = [
      '// @proxyDirectiveController',
      'function myThing($scope) {',
      '  // do something',
      '}'
    ].join('\n');

    var expected = [
      '// @proxyDirectiveController',
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
      '        return $injector.invoke($oldController, self, angular.extend({}, locals, extendedLocals));',
      '      }',
      '',
      '      $injector.invoke(newController, this, locals);',
      '    };',
      '',
      '    directive.controller.prototype = $oldController.prototype;',
      '    return $delegate;',
      '  });',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('can be disabled', function() {
    var input = [
      '// @proxyDirectiveController',
      'function myThing($scope) {',
      '  // do something',
      '}'
    ].join('\n');

    expect(lib.process(input, {mockDirectiveController:false}).code)
      .to.equal(input);
  });
});
