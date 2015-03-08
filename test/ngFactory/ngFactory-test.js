describe('ngFactory', function() {

  var lib = require('../lib');

  var types = require('recast').types;
  var n = types.namedTypes;
  var b = types.builders;
  var s = require('../../src/builders');

  var ngFactory = require('../../src/ngFactory');

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

      console.log(lib.print(extractStatements(input)));
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
