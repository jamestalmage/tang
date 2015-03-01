describe('buildInjection', function() {
  var print = require('../lib/print');
  var buildInjection = require('../../src/utils/buildNgInjectHandler');

  it('creates a beforeEach(inject(ids)) method',function(){
    var actual = print(buildInjection(['a','b','c']));
    expect(actual).to.equal([
      "beforeEach(inject(function(_a_, _b_, _c_) {",
      "    a = _a_;",
      "    b = _b_;",
      "    c = _c_;",
      "}));"
    ].join('\n') );
  });
});