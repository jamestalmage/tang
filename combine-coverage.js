var istanbul = require('istanbul'),
  collector = new istanbul.Collector(),
  reporter = new istanbul.Reporter(),
  sync = false;

collector.add(require('./coverage/nohack/coverage.json'));
collector.add(require('./coverage/hack/coverage.json'));

reporter.add('text');
reporter.addAll([ 'lcov', 'clover' ]);
reporter.write(collector, sync, function () {
  console.log('All reports generated');
});