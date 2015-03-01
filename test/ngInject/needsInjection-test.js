describe('needsInjection', function() {
  var parse = require('./../util').parse;
  var needsInjection = require('../../src/ngInject/needsInjection');
  var assert = require('assert');

  it('true when its the first statement', function () {
    var code = [
      "/* @ngInject */",
      "var a;"
    ];

    assert(needsInjection(
      parse(code).program.body[0]
    ));
  });

  it('true when its the second statement', function () {
    var code = [
      "var b;",
      "/* @ngInject */",
      "var a;"
    ];

    assert(needsInjection(
      parse(code).program.body[1]
    ));
  });

  it('false if there is no annotation', function () {
    var code = [
      "var a;"
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));

  });

  it('false if it contains an assignment', function () {
    var code = [
      "/* @ngInject */",
      "var b = 'hello';"
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));
  });

  it('false if it is not a variable declaration', function () {
    var code = [
      "/* @ngInject */",
      "function getArgs() {",
      "  return true",
      "}"
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));
  });
});