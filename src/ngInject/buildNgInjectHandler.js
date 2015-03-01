module.exports = buildNgInjectHandler;

var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;
var s = require('../utils/shared');

function buildNgInjectHandler(ids){
  var _ids_ = s.identifiers(s.wrapVariableIds(ids));
  ids = s.identifiers(ids);

  var assignments = s.assignmentStatements(ids, _ids_);

  var inject = s.injectCall(_ids_, assignments);

  return s.beforeEachStmt([inject]);
}
