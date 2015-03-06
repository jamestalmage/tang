var istanbul = require('istanbul'),
  collector = new istanbul.Collector(),
  reporter = new istanbul.Reporter(),
  sync = false;

collector.add(require('./coverage/recast/coverage-final.json'));
collector.add(require('./coverage/esprima/coverage-final.json'));
collector.add(require('./coverage/acorn/coverage-final.json'));

reporter.add('text');
reporter.addAll([ 'lcov', 'clover' ]);
reporter.write(collector, sync, function () {
  console.log('All reports generated');
});