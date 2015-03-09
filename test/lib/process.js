module.exports = function(src, opts) {
  var index = require('../../src/index');
  return index(src, require('./parse').setEsprimaProperty(opts));
};
