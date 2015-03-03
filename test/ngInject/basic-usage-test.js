describe('ngInject - basic usage', function() {
  var ngInject;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function (){
    ngInject = require('../../src/index');
  });

  it('will not create sourcemap by default', function() {
    var input = [
      'var c, d;',
      '// @ngInject',
      'var a, b;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.code).to.equal([
      'var c, d;',
      '// @ngInject',
      'var a, b;',
      "",
      "beforeEach(inject(function(_a_, _b_) {",
      "  a = _a_;",
      "  b = _b_;",
      "}));"
    ].join('\n'));

    expect(output.map).to.equal(null);
  });

  it('will create a sourcemap if sourceFileName is set', function() {
    var input = [
      'var c, d;',
      '// @ngInject',
      'var a, b;'
    ].join('\n');
    var output = ngInject(input,{sourceMap:true,sourceFileName:'src.js'});
    expect(output.code).to.equal([
      'var c, d;',
      '// @ngInject',
      'var a, b;',
      "",
      "beforeEach(inject(function(_a_, _b_) {",
      "  a = _a_;",
      "  b = _b_;",
      "}));"
    ].join('\n'));
    expect(!!output.map).to.equal(true);
  });
});