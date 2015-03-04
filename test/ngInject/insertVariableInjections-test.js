'use strict';

describe('ngInject - perform ast transformation', function() {
  var util = require('../lib');
  var insertVariableInjections = require('../../src/ngInject');

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
