var hasAnnotation = require('../utils/hasAnnotation');

module.exports = createInjector();
module.exports.create = createInjector;

var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;

function createInjector (regexp, logger) {

  regexp = regexp ||  /^\s*@ngProvide\s*$/;

  var needsInjection = require('./needsInjection').create(regexp, logger);
  var buildInjection = require('./buildNgProvideHandler');
  var collectVariableIdsAndInits = require('./collectVariableIdsAndInits');
  var hasNgProvideAnnotation = hasAnnotation(regexp);

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
      },
      visitAssignmentExpression: function(path) {
        var node = path.node;
        var parent = path.parent, parentNode = parent && parent.node;
        if(
          parentNode &&
          n.ExpressionStatement.check(parentNode) &&
          hasNgProvideAnnotation(parentNode)
        ){
          var injection = buildInjection([node.left], [node.right]);
          injection.comments = parentNode.comments;
          parent.replace(injection);
        }
        return false;
      }
    });
    return ast;
  }
}