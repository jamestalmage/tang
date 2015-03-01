module.exports = createInjector();
module.exports.create = createInjector;

var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

function createInjector (regexp, logger) {

  var needsInjection = require('./needsInjection').create(regexp, logger);
  var buildInjection = require('./buildNgProvideHandler');
  var collectVariableIdsAndInits = require('./collectVariableIdsAndInits');

  return addVariableInjections;

  function addVariableInjections (ast) {
    types.visit(ast, {
      visitVariableDeclaration: function (path) {
        var node = path.node;
        if (needsInjection(node)) {
          var idInits = collectVariableIdsAndInits(node);
          var ids = idInits.ids, inits = idInits.inits;

          var decl = b.variableDeclaration(
            'var',
            ids.map(function(id){
              return b.variableDeclarator(id,null);
            })
          );

          decl.comments = node.comments;


          path.replace(decl, buildInjection(ids, inits));
        }
        return false;
      }
    });
    return ast;
  }
}