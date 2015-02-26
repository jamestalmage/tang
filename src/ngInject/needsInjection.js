module.exports = create();
module.exports.create = create;

var types = require('ast-types');
var n = types.namedTypes;


function create(regexp, logger){

  regexp = regexp ||  /^\s*@ngInject\s*$/;

  logger = logger || require('./../silent-logger');

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
    if(hasInit(node)){
      logger.logRejectedNode('contains a variable initialization', node);
      return false;
    }
    logger.logAcceptedNode(node);
    return true;
  }

  function containsNgInjectAnnotation(node){
    if(node.leadingComments){  // esprima ast with `options.attachComments == true`
      return node.leadingComments.some(isNgInjectAnnotation);
    } else if (node.comments) {
      return node.comments.some(function(comment){  //recast style ast
        return comment.leading && isNgInjectAnnotation(comment);
      });
    }
    return false;
  }

  function isNgInjectAnnotation(comment){
    return regexp.test(comment.value);
  }

  function hasInit(node){
    n.VariableDeclaration.assert(node);
    var hasInit = false;
    types.visit(node,{
      visitVariableDeclarator:function(path){
        if(path.node.init !== null) hasInit = true;
        return false;
      }
    });
    return hasInit;
  }
}