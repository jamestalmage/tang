module.exports = requiredInjection;

var n = require('recast').types.namedTypes;

function requiredInjection (node){
  if(n.Identifier.check(node)) return node.name;
  if(n.MemberExpression.check(node)) return requiredInjection(node.object);
  if(n.CallExpression.check(node)) return requiredInjection(node.callee);
  return null;
}