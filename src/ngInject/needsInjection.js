var hasAnnotation = require('../utils/hasAnnotation');
module.exports = create();

module.exports.create = create;
var types = require('recast').types;
var n = types.namedTypes;
var requiredInjection = require('../utils/requiredInjection');


function create(regexp, logger){

  regexp = regexp ||  /^\s*@ngInject\s*$/;

  logger = logger || require('../silent-logger');

  var containsNgInjectAnnotation = hasAnnotation(regexp);

  return getsInjection;


  function getsInjection(node){
    if(!n.VariableDeclaration.check(node)){
      logger.logRejectedNode('not a VariableDeclaration', node);
      return false;
    }
    if(!containsNgInjectAnnotation(node)){
      logger.logRejectedNode('does not contain an NgInit comment', node);
      return false;
    }
    if(hasNonInjectableInit(node)){
      logger.logRejectedNode('contains a variable initialization', node);
      return false;
    }
    logger.logAcceptedNode(node);
    return true;
  }

  function hasNonInjectableInit(node){
    n.VariableDeclaration.assert(node);
    var found = false;
    types.visit(node,{
      visitVariableDeclarator:function(path){
        var init = path.node.init;
        if(init !== null){
          found = found || (requiredInjection(init) === null);
        }
        return false;
      }
    });
    return found;
  }
}