describe('ngFactory', function() {
  var types = require('recast').types;
  var n = types.namedTypes;
  var b = types.builders;
  var s = require('../src/builders');

  var ngFactory = require('../src/ngFactory');

  function instrumentFactoryFunction(code) {
    var node = firstNode(code);
    return ngFactory.instrumentFactoryFunction(node, node.id);
  }

  function extractStatements(code) {
    return b.program(ngFactory.extractStatements(firstNode(code)));
  }

  function firstNode(code) {
    return lib.parse(code).program.body[0];
  }

  it('ngFactory', function() {
    var input = [
      '// @ngFactory',
      'function foo(bar) {',
      '  function baz() {',
      '    return "foo" + bar;',  // should not put assignment on this return statement
      '  }',
      '  return baz;',
      '}'
    ].join('\n');

    var expected = [
      '// @ngFactory',
      'var foo;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    $provide.factory("foo", function(bar) {',
      '      function baz() {',
      '        return "foo" + bar;',
      '      }',
      '      return foo = baz;',
      '    });',
      '  });',
      '});'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('ngFactory - can be disabled', function() {
    var input = [
      '// @ngFactory',
      'function foo(bar) {',
      '  function baz() {',
      '    return "foo" + bar;',  // should not put assignment on this return statement
      '  }',
      '  return baz;',
      '}'
    ].join('\n');

    expect(lib.process(input, {ngFactory:false}).code).to.equal(input);
  });

  describe('extractName', function() {
    it('strips the identifier from the function', function() {
      var extracted = instrumentFactoryFunction('function bar() {}');
      expect(lib.print(extracted)).to.equal('function() {}');
    });

    it('performs assignment of return value', function() {
      var extracted = instrumentFactoryFunction('function bar() {return "a";}');
      expect(lib.print(extracted))
        .to.equal('function() {return bar = "a";}');
    });

    it('does not perform assignment on internal functions', function() {
      var input = [
        'function foo(bar) {',
        '  function baz() {',
        '    return "foo" + bar;',  // should not put assignment on this return statement
        '  }',
        '  return baz;',
        '}'
      ].join('\n');

      var extracted = instrumentFactoryFunction(input);

      var expected = [
        'function(bar) {',
        '  function baz() {',
        '    return "foo" + bar;',
        '  }',
        '  return foo = baz;',
        '}'
      ].join('\n');

      expect(lib.print(extracted)).to.equal(expected);
    });

    it('creates a beforeEachInjection', function() {
      var input = [
        'function foo(bar) {',
        '  function baz() {',
        '    return "foo" + bar;',  // should not put assignment on this return statement
        '  }',
        '  return baz;',
        '}'
      ].join('\n');

      var expected = [
        'var foo;',
        '',
        'beforeEach(function() {',
        '  angular.mock.module(function($provide) {',
        '    $provide.factory("foo", function(bar) {',
        '      function baz() {',
        '        return "foo" + bar;',
        '      }',
        '      return foo = baz;',
        '    });',
        '  });',
        '});'
      ].join('\n');

      expect(lib.print(extractStatements(input))).to.equal(expected);
    });
  });
});
