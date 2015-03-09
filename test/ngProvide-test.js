'use strict';

describe('ngProvide - basic usage', function() {
  var _ngProvide, ngProvide;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function() {
    _ngProvide = require('../src/index');
    ngProvide = function(code, opts) {
      return _ngProvide(code, require('./lib/parse').setEsprimaProperty(opts));
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

  it('will handle function declarations ', function() {
    var input = [
      '/* @ngProvide */ ',
      'function foo() {}'
    ].join('\n');

    var expected = [
      '/* @ngProvide */',
      'var foo;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    foo = function() {};',
      '    $provide.value("foo", foo);',
      '  });',
      '});'
    ].join('\n');

    expect(ngProvide(input).code).to.equal(expected);
  });

  it('will not touch variable declarations without init', function() {
    var code = [
      '// @ngProvide',
      'var a;'
    ].join('\n');

    var output = ngProvide(code);

    expect(output.code).to.equal(code);
  });
});
