var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var s = require('./builders');

function create(regexp) {
  var hasAnnotation = require('./hasAnnotation')(regexp);

  return function(node) {
    types.visit(node, {
      visitFunctionDeclaration: function(path) {
        var node = path.node;
        if (hasAnnotation(node)) {
          var stmts = extractStatements(node);
          stmts[0].comments = node.comments;
          path.replace.apply(path, stmts);
          return false;
        }
        this.traverse(path);
      }
    });
  };
}
module.exports = create;

function extractStatements(node) {
  n.FunctionDeclaration.assert(node);
  var id = node.id;

  var func = instrumentFactoryFunction(node, id);

  var decl = b.variableDeclaration(
    'var',
    [b.variableDeclarator(id, null)]
  );

  var moduleStmt = s.moduleCb(
    [b.identifier('$provide')],
    [s.provide('factory', b.literal(id.name), func)]
  );

  var bfe =  s.beforeEachStmt(
    [b.functionExpression(null, [], b.blockStatement([moduleStmt]))]
  );

  return [decl, bfe];
}

function instrumentFactoryFunction(originalFunc, assignmentId) {
  n.FunctionDeclaration.assert(originalFunc);
  n.Identifier.assert(assignmentId);
  types.visit(originalFunc.body, {
    visitFunction: function(path) {
      // prevent modification of return statements inside internal functions
      return false;
    },
    visitReturnStatement: function(path) {
      var node = path.node;
      var argument = node.argument;
      path.get('argument').replace(
        b.assignmentExpression(
          '=',
          assignmentId,
          argument
        )
      );
      return false;
    }
  });
  return b.functionExpression(null, originalFunc.params, originalFunc.body);
}

module.exports.extractStatements = extractStatements;
module.exports.instrumentFactoryFunction = instrumentFactoryFunction;
