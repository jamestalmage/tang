'use strict';

module.exports = print;

function print(ast) {
  return require('recast').print(ast, {tabWidth: 2}).code;
}
