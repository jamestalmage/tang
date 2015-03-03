describe('ngInject - basic usage - ', function() {
  var ngInject;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function (){
    ngInject = require('../../src/index');
  });

  it('will insert injections for provided variables', function() {
    var input = [
      '// @ngInject',
      'var a, b;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.code).to.equal([
      '// @ngInject',
      'var a, b;',
      "",
      "beforeEach(inject(function(_a_, _b_) {",
      "  a = _a_;",
      "  b = _b_;",
      "}));"
    ].join('\n'));
  });

  it('variable assignment will cause required variables to be injected', function() {
    var input = [
      '// @ngInject',
      'var a = b;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.code).to.equal([
      '// @ngInject',
      'var a;',
      "",
      "beforeEach(inject(function(b) {",
      "  a = b;",
      "}));"
    ].join('\n'));
  });

  it('variable assigned to member of value not previously injected', function() {
    var input = [
      '// @ngInject',
      'var a = b.name;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.code).to.equal([
      '// @ngInject',
      'var a;',
      "",
      "beforeEach(inject(function(b) {",
      "  a = b.name;",
      "}));"
    ].join('\n'));
  });

  it('variable assigned to member of previously injected value', function() {
    var input = [
      '// @ngInject',
      'var b, a = b.name;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.code).to.equal([
      '// @ngInject',
      'var b, a;',
      "",
      "beforeEach(inject(function(_b_) {",
      "  b = _b_;",
      "  a = b.name;",
      "}));"
    ].join('\n'));
  });

  it('will not create sourcemap by default', function() {
    var input = [
      'var c, d;',
      '// @ngInject',
      'var a, b;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.map).to.equal(null);
  });

  it('will create a sourcemap if sourceFileName is set', function() {
    var input = [
      'var c, d;',
      '// @ngInject',
      'var a, b;'
    ].join('\n');
    var output = ngInject(input,{sourceMap:true,sourceFileName:'src.js'});
    expect(!!output.map).to.equal(true);
  });
});