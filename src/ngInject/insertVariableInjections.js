module.exports = createInjector();
module.exports.create = createInjector;

var types = require('ast-types');
var n = types.namedTypes;

function createInjector (regexp, logger) {

  var needsInjection = require('./needsInjection').create(regexp, logger);
  var buildInjection = require('./buildInjection');
  var collectVariableIds = require('./collectVariableIds');

  return addVariableInjections;

  function addVariableInjections (ast) {
    types.visit(ast, {
      visitVariableDeclaration: function (path) {
        var node = path.node;
        if (needsInjection(node)) {
          var ids = collectVariableIds(node);
          path.insertAfter(buildInjection(ids));
        }
        return false;
      }
    });
    return ast;
  }
}