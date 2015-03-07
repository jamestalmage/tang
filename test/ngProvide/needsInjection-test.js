'use strict';

describe('ngProvide - needs injection', function() {
  var parse = require('../lib').parse;

  var needsInjection = require('../../src/ngProvide/needsInjection')(
    /^\s*@ngProvide\s*$/, require('../../src/silent-logger')
  );

  var assert = require('assert');

  it('true when its the first statement', function() {
    var code = [
      '/* @ngProvide */',
      'var a = sinon.spy();'
    ];

    assert(needsInjection(
      parse(code).program.body[0]
    ));
  });

  it('true when its the second statement', function() {
    var code = [
      'var b;',
      '/* @ngProvide */',
      'var a = sinon.spy();'
    ];

    assert(needsInjection(
      parse(code).program.body[1]
    ));
  });

  it('false if there is no annotation', function() {
    var code = [
      'var a = sinon.spy();'
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));

  });

  it('false if it does contains an assignment', function() {
    var code = [
      '/* @ngProvide */',
      'var b;'
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));
  });

  it('false if it is not a variable declaration', function() {
    var code = [
      '/* @ngProvide */',
      'function getArgs() {',
      '  return true',
      '}'
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));
  });
});
