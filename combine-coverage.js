var istanbul = require('istanbul'),
  collector = new istanbul.Collector(),
  reporter = new istanbul.Reporter(),
  sync = false;

collector.add(require('./coverage/recast/coverage.json'));
collector.add(require('./coverage/esprima/coverage.json'));
collector.add(require('./coverage/acorn/coverage.json'));

reporter.add('text');
reporter.addAll([ 'lcov', 'clover' ]);
reporter.write(collector, sync, function () {
  console.log('All reports generated');
});