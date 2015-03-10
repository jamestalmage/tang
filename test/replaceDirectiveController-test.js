describe('replaceDirectiveController', function() {
  var lib = require('./lib');

  it('blah', function() {
    var input = [
      '// @replaceDirectiveController',
      'function customClickDirective() {',
      '  this.doSomething = sinon.spy();',
      '}'
    ].join('\n');

    var expected = [
      '// @replaceDirectiveController',
      'var customClickDirective = [];',
      '',
      'beforeEach(angular.mock.module(function($provide) {',
      '  $provide.decorator("customClickDirective", function($delegate) {',
      '    var directive = $delegate[0];',
      '',
      '    directive.controller = function() {',
      '      customClickDirective.push(this);',
      '      this.doSomething = sinon.spy();',
      '    };',
      '',
      '    return $delegate;',
      '  });',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('will add "Directive" suffix automatically', function() {
    var input = [
      '// @replaceDirectiveController',
      'function customClick() {',
      '  this.doSomething = sinon.spy();',
      '}'
    ].join('\n');

    var expected = [
      '// @replaceDirectiveController',
      'var customClick = [];',
      '',
      'beforeEach(angular.mock.module(function($provide) {',
      '  $provide.decorator("customClickDirective", function($delegate) {',
      '    var directive = $delegate[0];',
      '',
      '    directive.controller = function() {',
      '      customClick.push(this);',
      '      this.doSomething = sinon.spy();',
      '    };',
      '',
      '    return $delegate;',
      '  });',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('can be turned off', function() {
    var input = [
      '// @replaceDirectiveController',
      'function customClick() {',
      '  this.doSomething = sinon.spy();',
      '}'
    ].join('\n');

    var options = {replaceDirectiveController: false};
    expect(lib.process(input, options).code).to.equal(input);
  });
});
