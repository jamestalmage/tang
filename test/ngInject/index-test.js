describe('insertVariableInjections', function() {
  var ngInject;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function (){
    ngInject = require('../../src/ngInject/index');
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

    expect(output.map).to.equal(undefined);
  });

  it('will create a sourcemap if sourceFileName is set', function() {
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

  it('will pass through sourceFileName and inputSourceMap', function() {
    var parse = sinon.spy();
    var print = sinon.spy();
    var insertVariableInjections = sinon.spy();
    ngInject = proxyquire('../../src/ngInject',{
      'recast':{
        parse:parse,
        print:print
      },
      './insertVariableInjections':insertVariableInjections
    });

    ngInject('var a;',{sourceFileName:'input.src',inputSourceMap:{a:'a',b:'b'}});

    expect(parse).to.have.been.calledWith(
      'var a;',
      {
        sourceFileName:'input.src',
        sourceMapName:'input.src.map',
        inputSourceMap:{a:'a',b:'b'}
      }
    );
  });
});