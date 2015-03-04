describe('main', function() {
  var process, input, pathToIndex, index;
  var proxyquire    = require('proxyquire');
  var sinon         = require('sinon');
  var convert       = require('convert-source-map');

  beforeEach(function() {
    pathToIndex = '../src/index';
    index = require(pathToIndex);
    process = function(src, opts) {
      return index(src, require('./lib/parse').setEsprimaProperty(opts));
    };
    input = [
      'var e, f;',
      '// @ngInject',
      'var c, d;',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n');
  });

  it('will not create sourcemap by default', function() {
    var output = process(input);
    expect(output.code).to.equal([
      'var e, f;',
      '',
      '// @ngInject',
      'var c, d;',
      '',
      'beforeEach(inject(function(_c_, _d_) {',
      '  c = _c_;',
      '  d = _d_;',
      '}));',
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

  it('ngInject can be turned off', function() {
    var output = process(input, {ngInject:false});
    expect(output.code).to.equal([
      'var e, f;',
      '// @ngInject',
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

  it('ngProvide can be turned off', function() {
    var output = process(input, {ngProvide: false});
    expect(output.code).to.equal([
      'var e, f;',
      '',
      '// @ngInject',
      'var c, d;',
      '',
      'beforeEach(inject(function(_c_, _d_) {',
      '  c = _c_;',
      '  d = _d_;',
      '}));',
      '',
      '// @ngProvide',
      'var a = "a", b = "b";'
    ].join('\n'));

    expect(output.map).to.equal(null);
  });

  it('ngProvide and ngInject can be turned off', function() {
    var output = process(input, {ngProvide: false, ngInject: false});
    expect(output.code).to.equal(input);
    expect(output.map).to.equal(null);
  });

  it('will run all injections with sensible defaults', function() {
    var code = index(input).code;
    expect(code).to.equal([
      'var e, f;',
      '',
      '// @ngInject',
      'var c, d;',
      '',
      'beforeEach(inject(function(_c_, _d_) {',
      '  c = _c_;',
      '  d = _d_;',
      '}));',
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
  });

  it('will create a sourcemap if sourceFileName is set', function() {
    var output = process(input, {sourceMap: true, sourceFileName: 'src.js'});
    expect(output.code).to.equal([
      'var e, f;',
      '',
      '// @ngInject',
      'var c, d;',
      '',
      'beforeEach(inject(function(_c_, _d_) {',
      '  c = _c_;',
      '  d = _d_;',
      '}));',
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

  it('will create a sourcemap if sourceFileName is set', function() {
    var output = process(input, {
      sourceMap: true,
      sourceFileName:'src.js',
      appendSourceMapComment:true}
    );
    expect(convert.fromSource(output.code)).not.to.equal(null);
  });

  it('will read sourcemap comments in leau of inputSourceMap', function() {
    var fromSource = sinon.stub();
    var parse = sinon.spy();
    var print = sinon.stub();
    var toObj = sinon.spy();
    process = proxyquire(pathToIndex, {
      'recast': {
        parse: parse,
        print: print
      },
      'convert-source-map': {
        fromSource: fromSource
      }
    });
    fromSource.returns({toObject: toObj});
    print.returns({code: 'blah'});
    process(input, {sourceMap: true});
    expect(fromSource.called).to.equal(true);
    expect(toObj.called).to.equal(true);
    fromSource.reset();
    toObj.reset();
    fromSource.returns(null);
    process(input, {sourceMap: true});
    expect(fromSource.called).to.equal(true);
    expect(toObj.called).to.equal(false);
    fromSource.reset();
    process(input, {sourceMap: true, readSourceMapComments: false});
    expect(fromSource.called).to.equal(false);
  });

  it('will pass through sourceFileName and inputSourceMap', function() {
    var parse = sinon.spy();
    var print = sinon.stub();
    process = proxyquire('../src/', {
      'recast': {
        parse: parse,
        print: print
      }
    });

    print.returns({code:'blahblah', map:'map'});

    process('var a;', {
      sourceMap: true,
      sourceFileName: 'input.src',
      inputSourceMap: {a: 'a', b: 'b'}
    });

    var args = parse.args[0];
    expect(args[0]).to.equal('var a;');
    expect(args[1]).to.have.property('sourceFileName').equal('input.src');
    expect(args[1]).to.have.property('sourceMapName').equal('input.src.map');
    expect(args[1]).to.have.property('inputSourceMap').eql({a:'a', b:'b'});
  });
});
