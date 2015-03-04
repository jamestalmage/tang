'use strict';

module.exports = {
  logRejectedNode:function(reasons, node) {
    if (Array.isArray(reasons)) {
      reasons = reasons.join(', ');
    }
    reasons = reasons || '';
    logNode('rejected - ' + reasons, node);
  },
  logAcceptedNode:function(node) {
    logNode('accepted ', node);
  },
  logCode:function(code) {
    logNode('', code);
  }
};

function logNode(message, node) {
  prefix(message);
  var code = require('recast').print(node).code;
  console.log(code);
  suffix();
}

function logCode(message, code) {
  prefix(message);
  console.log(code);
  suffix();
}

function prefix(message) {
  console.log('---------------' + message + '----------------------------');
}

function suffix() {
  console.log('--------------------------------------------------------');
  console.log('\n\n');
}
