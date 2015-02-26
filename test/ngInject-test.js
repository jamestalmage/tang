describe('insertVariableInjections', function() {
  var ngInject = require('../src/ngInject/');

  it('will not create sourcemap by default',function(){
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

    expect(output.map).to.equal(undefined);
  });

  it('will create a sourcemap if sourceFileName is set',function(){
    var input = [
      'var c, d;',
      '// @ngInject',
      'var a, b;'
    ].join('\n');
    var output = ngInject(input,{sourceFileName:'src.js'});
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