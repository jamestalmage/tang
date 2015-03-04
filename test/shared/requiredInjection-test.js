'use strict';

describe('requiredInjection', function() {
  var parse = require('../lib').parse;

  var _requiredInjection = require('../../src/utils/requiredInjection');

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
