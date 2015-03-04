module.exports = parse;

var assert = require('assert');
var recast = require('recast');


var currentParser;
logAndStoreParserSetting();


/**
 * Wrapper for recast.parse which optionally uses:
 *  1. Recasts internal custom parser
 *  2. Esprima.
 *  3. Acorn.js
 *
 * Which one is determined by process.env.NG_UTILS_PARSER
 *
 * See this discussion on attaching comments:
 * https://github.com/benjamn/recast/issues/159#issuecomment-76047125
 *
 * NOTE: When using Esprima, it has side effects on `options` object passed to parse
 *       (it sets the `esprima` property).
 *       Shouldn't be a problem since this is only used in testing.
 *
 * @param {string|string[]} code to be parsed. Arrays will be joined using `.join('\n')`
 */
function parse(code){
  if(Array.isArray(code)) code = code.join('\n');
  assert.equal(typeof code, "string", "code is wrong type, must be {string|string[]}");
  var prop = esprimaProperty();
  return prop ? recast.parse(code, {esprima:{parse:prop}}) : recast.parse(code);
}

function setEsprimaProperty(opts){
  opts = opts || {};
  var prop = esprimaProperty();
  if(prop){
    opts.esprima = {parse:prop};
  }
  return opts;
}

parse.setEsprimaProperty = setEsprimaProperty;
parse.esprimaProperty = esprimaProperty;

function esprimaProperty(){

  if(getEnv() !== currentParser){
    logAndStoreParserSetting(true);
  }

  switch (currentParser){
    case 'recast': return null;

    case 'esprima': return function(code, options){
      options.attachComment = true;
      return require('esprima-fb').parse(code, options);
    };

    case 'acorn': return function(code,options){
      var comments = [];
      var ast = require('acorn').parse(code,{
        locations: true,
        ranges: true,
        onComment: comments
      });
      ast.comments = comments;
      return ast;
    };
  }

  throw new Error('Unacceptable value for process.env.NG_UTILS_PARSER: ' + process.env.NG_UTILS_PARSER);
}


function logAndStoreParserSetting(changed){
  currentParser = getEnv();
  var message = changed ? ['env.NG_UTILS_PARSER changed! '] : [];
  message.push('using ', currentParser);
  console.log(message.join(''));
}

function getEnv(){
  return (process.env.NG_UTILS_PARSER || 'recast').toLowerCase();
}