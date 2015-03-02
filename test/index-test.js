describe('main', function() {
  var process;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function (){
    process = require('../src/index');
  });

  it('will not create sourcemap by default', function() {
    var input = [
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = process(input);
    expect(output.code).to.equal([
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      "",
      "beforeEach(inject(function(_c_, _d_) {",
      "  c = _c_;",
      "  d = _d_;",
      "}));",
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

  it('ngInject can be turned off', function() {
    var input = [
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = process(input, {ngInject:false});
    expect(output.code).to.equal([
      'var e, f;',
      '// @ngInject',
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

  it('ngProvide can be turned off', function() {
    var input = [
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = process(input,{ngProvide:false});
    expect(output.code).to.equal([
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      "",
      "beforeEach(inject(function(_c_, _d_) {",
      "  c = _c_;",
      "  d = _d_;",
      "}));",
      '',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n'));

    expect(output.map).to.equal(undefined);
  });

  it('ngProvide and ngInject can be turned off', function() {
    var input = [
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = process(input,{ngProvide:false,ngInject:false});
    expect(output.code).to.equal([
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n'));

    expect(output.map).to.equal(undefined);
  });

  it('will create a sourcemap if sourceFileName is set', function() {
    var input = [
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
    var output = process(input,{sourceFileName:'src.js'});
    expect(output.code).to.equal([
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      "",
      "beforeEach(inject(function(_c_, _d_) {",
      "  c = _c_;",
      "  d = _d_;",
      "}));",
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
    process = proxyquire('../src/',{
      'recast':{
        parse:parse,
        print:print
      },
      './insertVariableInjections':insertVariableInjections
    });

    process('var a;',{sourceFileName:'input.src',inputSourceMap:{a:'a',b:'b'}});

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