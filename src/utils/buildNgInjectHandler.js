module.exports = buildNgInjectHandler;

var types = require('ast-types');
var n = types.namedTypes;
var b = types.builders;
var s = require('./shared');



  function buildNgInjectHandler(ids){
    var _ids_ = s.wrapVariableIds(ids);

    ids = ids.map(b.identifier.bind(b));
    _ids_ = _ids_.map(b.identifier.bind(b));

    var assignments = s.assignmentStatements(ids, _ids_);

    var inject = s.injectCall(_ids_, assignments);

    return b.expressionStatement(
      s.beforeEachCall(inject)
    );
  }
