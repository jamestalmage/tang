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
    [s.provide('service', b.literal(id.name), func)]
  );

  var bfe =  s.beforeEachStmt(
    [b.functionExpression(null, [], b.blockStatement([moduleStmt]))]
  );

  return [decl, bfe];
}
module.exports.extractStatements = extractStatements;

function instrumentFactoryFunction(originalFunc, assignmentId) {
  n.FunctionDeclaration.assert(originalFunc);
  n.Identifier.assert(assignmentId);

  var stmt = b.expressionStatement(
    b.assignmentExpression('=', assignmentId, b.identifier('this'))
  );
  originalFunc.body.body.unshift(stmt);

  return b.functionExpression(null, originalFunc.params, originalFunc.body);
}
module.exports.instrumentFactoryFunction = instrumentFactoryFunction;
