describe('', function() {
  it('handles explicit value return statements', function() {
    var input = [
      '// @ngController',
      'function blah() {',
      '  return {a: "a"};',
      '}'
    ].join('\n');

    var expected = [
      'var blah = [];',
      '',
      'beforeEach(angular.mock.module(function($controllerProvider) {',
      '  $controllerProvider.register("blah", function() {',
      '    return blah[blah.length] = {a: "a"};',
      '  });',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it.only('handles no return statement', function() {
    var input = [
      '// @ngController',
      'function blah() {',
      '  console.log("howdy");',
      '}'
    ].join('\n');

    var expected = [
      'var blah = [];',
      '',
      'beforeEach(angular.mock.module(function($controllerProvider) {',
      '  $controllerProvider.register("blah", function() {',
      '    console.log("howdy");',
      '    blah.push(this);',
      '  });',
      '}));'
    ].join('\n');

    console.log(input);
    console.log(expected);

    expect(lib.process(input).code).to.equal(expected);
  });

  it('handles return statement without argument', function() {
    var input = [
      '// @ngController',
      'function blah() {',
      '  console.log("howdy");',
      '  return;',
      '}'
    ].join('\n');

    var expected = [
      'var blah = [];',
      '',
      'beforeEach(angular.mock.module(function($controllerProvider) {',
      '  $controllerProvider.register("blah", function() {',
      '    console.log("howdy");',
      '    blah.push(this);',
      '    return;',
      '  });',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('does not traverse internal functions when  ', function() {
    var input = [
      '// @ngController',
      'function blah(qux) {',
      '  function foo(){ return {bar: "baz"}; }',
      '  return foo;',
      '}'
    ].join('\n');

    var expected = [
      'var blah = [];',
      '',
      'beforeEach(angular.mock.module(function($controllerProvider) {',
      '  $controllerProvider.register("blah", function(qux) {',
      '    function foo(){ return {bar: "baz"}; }',
      '    return blah[blah.length] = foo;',
      '  });',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('wraps returns in block statements as necessary', function() {
    var input = [
      '// @ngController',
      'function blah() {',
      '  if (foo) return;' +
      '  return {a: "a"};',
      '}'
    ].join('\n');

    var expected = [
      'var blah = [];',
      '',
      'beforeEach(angular.mock.module(function($controllerProvider) {',
      '  $controllerProvider.register("blah", function() {',
      '    if (foo) {',
      '      blah.push(this);',
      '      return;',
      '    }  return blah[blah.length] = {a: "a"};',
      '  });',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('can be disabled', function() {
    var input = [
      '// @ngController',
      'function blah(qux) {',
      '  function foo(){ return {bar: "baz"}; }',
      '  return foo;',
      '}'
    ].join('\n');

    expect(lib.process(input, {ngController:false}).code).to.equal(input);
  });
});
