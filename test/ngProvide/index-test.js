describe('insertVariableInjections', function() {
  var ngProvide;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function (){
    ngProvide = require('../../src/ngProvide/index');
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
      "beforeEach(function() {",
      "  angular.mock.module(function($provide) {",
      "    a = \"a\";",
      "    b = \"b\";",
      "    $provide.value(\"a\", a);",
      "    $provide.value(\"b\", b);",
      "  });",
      "});"
    ].join('\n'));

    expect(output.map).to.equal(undefined);
  });

  it('will create a sourcemap if sourceFileName is set', function() {
    var input = [
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = ngProvide(input,{sourceFileName:'src.js'});
    expect(output.code).to.equal([
      'var c, d;',
      '',
      '// @ngProvide',
      'var a, b;',
      '',
      "beforeEach(function() {",
      "  angular.mock.module(function($provide) {",
      "    a = \"a\";",
      "    b = \"b\";",
      "    $provide.value(\"a\", a);",
      "    $provide.value(\"b\", b);",
      "  });",
      "});"
    ].join('\n'));
    expect(!!output.map).to.equal(true);
  });

  it('will pass through sourceFileName and inputSourceMap', function() {
    var parse = sinon.spy();
    var print = sinon.spy();
    var insertVariableInjections = sinon.spy();
    ngProvide = proxyquire('../../src/ngProvide',{
      'recast':{
        parse:parse,
        print:print
      },
      './insertVariableInjections':insertVariableInjections
    });

    ngProvide('var a;',{sourceFileName:'input.src',inputSourceMap:{a:'a',b:'b'}});

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