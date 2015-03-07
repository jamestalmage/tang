'use strict';

describe('ngProvide - basic usage', function() {
  var _ngProvide, ngProvide;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function() {
    _ngProvide = require('../../src/index');
    ngProvide = function(code, opts) {
      return _ngProvide(code, require('../lib/parse').setEsprimaProperty(opts));
    };
  });

  it('will not create sourcemap by default', function() {
    var input = [
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = ngProvide(input);
    expect(output.code).to.equal([
      'var c, d;',
      '',
      '// @ngProvide',
      'var a, b;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = "a";',
      '    b = "b";',
      '    $provide.value("a", a);',
      '    $provide.value("b", b);',
      '  });',
      '});'
    ].join('\n'));

    expect(output.map).to.equal(null);
  });

  it('will work on assignment', function() {
    var input = [
      'var a, b;',
      '// @ngProvide',
      'a = "a";',
      '',
      'b = "b"'
    ].join('\n');
    var output = ngProvide(input);

    var expected = [
      'var a, b;',
      '// @ngProvide',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = "a";',
      '    $provide.value("a", a);',
      '  });',
      '});',
      '',
      'b = "b"'
    ].join('\n');

    expect(output.code).to.equal(expected);
  });

  it('will create a sourcemap if sourceFileName is set', function() {
    var input = [
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = ngProvide(input, {sourceMap:true, sourceFileName:'src.js'});
    expect(output.code).to.equal([
      'var c, d;',
      '',
      '// @ngProvide',
      'var a, b;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = "a";',
      '    b = "b";',
      '    $provide.value("a", a);',
      '    $provide.value("b", b);',
      '  });',
      '});'
    ].join('\n'));
    expect(!!output.map).to.equal(true);
  });

  it('will not touch annotated functions', function() {
    var code = [
      '/* @ngProvide */ ',
      'function foo() {}'
    ].join('\n');

    var output = ngProvide(code);

    expect(output.code).to.equal(code);
  });

  it('will not touch variable declarations without init', function() {
    var code = [
      '// @ngProvide',
      'var a;'
    ].join('\n');

    var output = ngProvide(code);

    expect(output.code).to.equal(code);
  });

  it('@ngValue - provides a value', function() {
    var input = [
      '// @ngValue',
      'var a = "a";'
    ].join('\n');
    var output = ngProvide(input);
    expect(output.code).to.equal([
      '// @ngValue',
      'var a;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = "a";',
      '    $provide.value("a", a);',
      '  });',
      '});'
    ].join('\n'));
  });

  it('@ngValue - can be disabled', function() {
    var input = [
      '// @ngValue',
      'var a = "b";'
    ].join('\n');
    var output = ngProvide(input, {ngValue:false});
    expect(output.code).to.equal([
      '// @ngValue',
      'var a = "b";'
    ].join('\n'));
  });

  it('@ngConstant - provides a constant', function() {
    var input = [
      '// @ngConstant',
      'var a = "b";'
    ].join('\n');
    var output = ngProvide(input);
    expect(output.code).to.equal([
      '// @ngConstant',
      'var a;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    a = "b";',
      '    $provide.constant("a", a);',
      '  });',
      '});'
    ].join('\n'));
  });

  it('@ngConstant - can be disabled', function() {
    var input = [
      '// @ngConstant',
      'var a = "b";'
    ].join('\n');
    var output = ngProvide(input, {ngConstant:false});
    expect(output.code).to.equal([
      '// @ngConstant',
      'var a = "b";'
    ].join('\n'));
  });

  xit('@ngFactory - provides a factory', function() {
    // @ngFactory
    var timeoutInSeconds = function($timeout) {
      return function(fn, delay, invokeApply) {
        return $timeout(fn, delay * 1000, invokeApply);
      };
    };

    // @ngFactory
    var timeoutInSeconds;

    beforeEach(function() {
      angular.mock.module(function($provide) {
        function timeoutInSecondsFactory($timeout) {

        }
      });
    });
  });
});
