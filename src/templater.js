var recast = require('recast');
var path = require('path');
var fs = require('fs');

var parse = recast.parse.bind(recast);

module.exports = {
  process: process,
  parse: parse,
  parseFile: parse
};

function process(ast, replacements) {
  types.visit(ast, {
    visitIdentifier: function replace(path) {
      var node = path.node;
      var result = /^\$\$([a-zA-Z_$][0-9a-zA-Z_$]*)\$\$$/.exec(node.name);
      var replacement;
      if (result && (replacement = replacements[result[1]])) {
        var replacePointer = path;
        switch (path.parent.node.type){
          case 'ExpressionStatement':
            console.log('going to parent');
            replacePointer = path.parent;
        }

        if (!Array.isArray(replacement)) {
          replacePointer.replace(replacement);
        } else {
          replacePointer.replace.apply(replacePointer, replacement);
        }
        return false;
      }
      this.traverse(path);
    }
  });

  return ast;
}

function parseFile(str) {
  return parse(fs.readFileSync(str))
}