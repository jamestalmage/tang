'use strict';

describe('ngInject - basic usage - ', function() {
  var _ngInject, ngInject;
  var proxyquire = require('proxyquire');
  var sinon = require('sinon');

  beforeEach(function() {
    _ngInject = require('../src/index');
    ngInject = function(code, opts) {
      return _ngInject(code, require('./lib/parse').setEsprimaProperty(opts));
    };
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
      '',
      'beforeEach(inject(function(_a_, _b_) {',
      '  a = _a_;',
      '  b = _b_;',
      '}));'
    ].join('\n'));
  });

  it('variable assignment causes injection of required variables', function() {
    var input = [
      '// @ngInject',
      'var a = b;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.code).to.equal([
      '// @ngInject',
      'var a;',
      '',
      'beforeEach(inject(function(b) {',
      '  a = b;',
      '}));'
    ].join('\n'));
  });

  it('assignment to member of value not previously injected', function() {
    var input = [
      '// @ngInject',
      'var a = b.name;'
    ].join('\n');
    var output = ngInject(input);
    expect(output.code).to.equal([
      '// @ngInject',
      'var a;',
      '',
      'beforeEach(inject(function(b) {',
      '  a = b.name;',
      '}));'
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
      '',
      'beforeEach(inject(function(_b_) {',
      '  b = _b_;',
      '  a = b.name;',
      '}));'
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
    var output = ngInject(input, {sourceMap:true, sourceFileName:'src.js'});
    expect(!!output.map).to.equal(true);
  });
});

describe('ngInject - collect variable Ids', function() {
  var parse = require('./lib/parse');
  var _collectVariableIds = require('../src/ngInject').collectVariableIds;

  function collectVariableIds(node) {
    return _collectVariableIds(node).ids.map(
      function(node) {return node.name;}
    );
  }

  it('a, b, c', function() {
    expect(collectVariableIds(parse('var a, b, c;').program.body[0]))
      .to.eql(['a', 'b', 'c']);
  });

  it('d', function() {
    expect(collectVariableIds(parse('var d;').program.body[0]))
      .to.eql(['d']);
  });

  it('e, f, g', function() {
    expect(collectVariableIds(parse('var e, f, g;').program.body[0]))
      .to.eql(['e', 'f', 'g']);
  });
});

describe('ngInject - perform ast transformation', function() {
  var util = require('./lib/index');
  var insertVariableInjections = require('../src/ngInject');

  it('inserts a beforeEach', function() {
    var input = util.parse([
      'var c, d;',
      '// @ngInject',
      'var a, b;'
    ]);
    var output = util.print(insertVariableInjections(input));
    expect(output).to.equal([
      'var c, d;',
      '',
      '// @ngInject',
      'var a, b;',
      '',
      'beforeEach(inject(function(_a_, _b_) {',
      '  a = _a_;',
      '  b = _b_;',
      '}));'
    ].join('\n'));
  });
});

describe('ngInject - needs Injection', function() {
  var parse = require('./lib/index').parse;
  var logger = require('../src/silent-logger');
  var needsInjection = require('../src/ngInject').needsInjection(/\s+@ngInject\s+/, logger);
  var assert = require('assert');

  it('true when its the first statement', function() {
    var code = [
      '/* @ngInject */',
      'var a;'
    ];

    assert(needsInjection(
      parse(code).program.body[0]
    ));
  });

  it('true when its the second statement', function() {
    var code = [
      'var b;',
      '/* @ngInject */',
      'var a;'
    ];

    assert(needsInjection(
      parse(code).program.body[1]
    ));
  });

  it('false if there is no annotation', function() {
    var code = [
      'var a;'
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));

  });

  it('false if it contains an assignment to a literal', function() {
    var code = [
      '/* @ngInject */',
      'var b = "hello";'
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));
  });

  it('false if it is not a variable declaration', function() {
    var code = [
      '/* @ngInject */',
      'function getArgs() {',
      '  return true',
      '}'
    ];

    assert(!needsInjection(
      parse(code).program.body[0]
    ));
  });
});

describe('requiredInjection', function() {
  var parse = require('./lib').parse;

  var _requiredInjection = require('../src/ngInject').requiredInjection;

  function requiredInjection(input) {
    var ast = parse(input);
    return _requiredInjection(ast.program.body[0].declarations[0].init);
  }

  it('assignment to another variable', function() {
    expect(requiredInjection('var a = b')).to.equal('b');
  });

  it('assignment to member of a variable', function() {
    expect(requiredInjection('var a = c.d')).to.equal('c');
  });

  it('assignment to member of a member of a variable', function() {
    expect(requiredInjection('var a = e.f.g')).to.equal('e');
  });

  it('assignment to call exp', function() {
    expect(requiredInjection('var a = h()')).to.equal('h');
  });

  it('assignment to call exp', function() {
    expect(requiredInjection('var a = i.j()')).to.equal('i');
  });

  describe('returns null', function() {
    it('function decl', function() {
      expect(requiredInjection('var a = function b(){}')).to.equal(null);
    });
    it('call of function decl', function() {
      expect(requiredInjection('var a = (function b(){})()')).to.equal(null);
    });
    it('number literal', function() {
      expect(requiredInjection('var a = 2')).to.equal(null);
    });
    it('boolean literal', function() {
      expect(requiredInjection('var a = true')).to.equal(null);
    });
    it('string literal', function() {
      expect(requiredInjection('var a = "hello"')).to.equal(null);
    });
  });
});
