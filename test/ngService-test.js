describe('ngFactory', function() {

  var lib = require('./lib/index');

  var types = require('recast').types;
  var n = types.namedTypes;
  var b = types.builders;

  var _ngService = require('../src/ngService');

  function ngService(code) {
    return b.program(_ngService.extractStatements(firstNode(code)));
  }

  function firstNode(code) {
    return lib.parse(code).program.body[0];
  }

  it('works', function() {
    var input = [
      'function myService(injectedDependency){',
      '  this.foo = "bar";',
      '}'
    ].join('\n');

    var output =  lib.print(ngService(input));

    var expected = [
      'var myService;',
      '',
      'beforeEach(function() {',
      '  angular.mock.module(function($provide) {',
      '    $provide.service("myService", function(injectedDependency) {',
      '      myService = this;',
      '      this.foo = "bar";',
      '    });',
      '  });',
      '});'
    ].join('\n');

    expect(output).to.equal(expected);
  });

});
