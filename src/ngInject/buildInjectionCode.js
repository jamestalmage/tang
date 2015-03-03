module.exports = buildNgInjectHandler;

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var s = require('../utils/builders');

function buildNgInjectHandler(obj){
  //var _ids_ = s.identifiers(s.wrapVariableIds(ids));
  //ids = s.identifiers(ids);

  //var assignments = s.assignmentStatements(ids, _ids_);

  var inject = s.injectCall(obj.inject, obj.assign);

  return s.beforeEachStmt([inject]);
}
