'use strict';

var assert = require('assert');

module.exports = function(regexp) {
  assert(regexp instanceof RegExp, 'expected regular expression: ' + regexp);

  return containsNgInjectAnnotation;

  function containsNgInjectAnnotation(node) {
    if (node.leadingComments) {  // esprima ast with `options.attachComments == true`
      return node.leadingComments.some(isNgInjectAnnotation);
    } else if (node.comments) {
      return node.comments.some(function(comment) {  //recast style ast
        return comment.leading && isNgInjectAnnotation(comment);
      });
    }
    return false;
  }

  function isNgInjectAnnotation(comment) {
    return regexp.test(comment.value);
  }
};
