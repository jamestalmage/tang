module.exports = parse;

var assert = require('assert');
var recast = require('recast');


var commentHack;
logAndStoreCommentHackSetting();


/**
 * Wrapper for recast.parse which adds will optionally insert the `attachComments` option
 * when esprima.parse gets called. Which one is determined by process.env.RECAST_COMMENT_HACK
 * Used to test both methods until I settle on one.
 *
 * See this discussion on attaching comments:
 * https://github.com/benjamn/recast/issues/159#issuecomment-76047125
 *
 * NOTE: When `process.env.RECAST_COMMENT_HACK is true,
 *       it has side effects on `options` object passed to parse (it sets the `esprima` property).
 *       Shouldn't be a problem since this is only used in testing.
 *
 * @param {string|string[]} code to be parsed. Arrays will be joined using `.join('\n')`
 */
function parse(code){
  if(Array.isArray(code)) code = code.join('\n');
  assert.equal(typeof code, "string", "code is wrong type, must be {string|string[]}");

  if(getEnv() !== commentHack){
    logAndStoreCommentHackSetting(true);
  }

  if(commentHack){
    return recast.parse(code, {esprima:{
      parse:function(code,options){
        options.attachComment = true;
        return require('esprima-fb').parse(code, options);
      }
    }});
  }
  else {
    return recast.parse(code);
  }
}

function logAndStoreCommentHackSetting(changed){
  commentHack = getEnv();
  var message = changed ? ['env.RECAST_COMMENT_HACK changed! '] : [];
  message.push(commentHack ? '*USING*' : '*NOT* using');
  message.push(' comment hack!');
  console.log(message.join(''));
}

function getEnv(){
  return !!process.env.RECAST_COMMENT_HACK;
}