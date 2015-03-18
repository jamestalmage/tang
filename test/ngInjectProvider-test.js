describe('@ngInjectProvider', function() {
  it('injects a provider', function() {
    var input = [
      '//@ngInjectProvider',
      'var greetProvider;'
    ].join('\n');

    var expected = [
      '//@ngInjectProvider',
      'var greetProvider;',
      '',
      'beforeEach(module(function(_greetProvider_) {',
      '  greetProvider = _greetProvider_;',
      '}));'
    ].join('\n');

    expect(lib.process(input).code).to.equal(expected);
  });

  it('can be turned off', function() {
    var input = [
      '//@ngInjectProvider',
      'var greetProvider;'
    ].join('\n');

    expect(lib.process(input, {ngInjectProvider:false}).code).to.equal(input);
  });
});
