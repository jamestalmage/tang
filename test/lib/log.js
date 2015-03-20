module.exports = log;

var process = require('./process');
var print = require('./print');

function log(astOrCode, opts) {
  if (typeof astOrCode === 'string' || Array.isArray(astOrCode)) {
    console.log(process(astOrCode, opts).code);
  } else {
    console.log(print(astOrCode));
  }
}
