module.exports.replace = create;
module.exports.proxy = createProxy;
module.exports.controller = createController;

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var assert = require('assert');
var util = require('util');

function createController(regexp) {
  assert(util.isRegExp(regexp), 'regexp required');
  var hasAnnotation = require('./hasAnnotation')(regexp);
  return function(node) {
    types.visit(node, {
      visitVariableDeclaration: function(path) {
        var node = path.node;
        if (hasAnnotation(node)) {
          installControllers(path, node.declarations.map(function(decl) {
            n.VariableDeclarator.assert(decl);
            var expr = decl.init;
            assert(expr, 'must have an init');
            var init = null;
            if (n.Function.check(expr)) {
              instrumentControllerFunction(expr, decl.id);
              init = b.arrayExpression([]);
            } else {
              expr = b.assignmentExpression('=', decl.id, expr);
            }
            return {id: decl.id, expr: expr, init:init};
          }));
          return false;
        }
        this.traverse(path);
      },
      visitFunctionDeclaration: function(path) {
        var node = path.node;
        if (hasAnnotation(node)) {
          instrumentControllerFunction(node, node.id);

          // strip the name from the function declaration so it does not shadow the variable;
          var controllerExpr = b.functionExpression(null, node.params, node.body);

          installControllers(path, [{id: node.id, expr:controllerExpr, init:b.arrayExpression([])}]);
          return false;
        }
        this.traverse(path);
      }
    });
  };
}

function instrumentControllerFunction(node, id) {
  n.Function.assert(node);
  types.visit(node.body, {
    visitFunction: function() {
      return false;
    },
    visitReturnStatement: function(path) {
      pushReturnStatement(path, id);
      return false;
    }
  });

  var stmts = node.body.body;

  if (!n.ReturnStatement.check(stmts[stmts.length - 1])) {
    stmts.push(pushThisStatement(id));
  }
}

function installControllers(path, exprs) {
  path.replace(
    b.variableDeclaration('var', exprs.map(function(val) {
      return b.variableDeclarator(val.id, val.init || null);
    })),
    callStmt(
      i.beforeEach,
      [b.callExpression(
        mAngularMockModule,
        [callback(
          [i.$controllerProvider],
          exprs.map(function(val) {
            return callStmt(m$controllerProviderRegister, [b.literal(val.id.name), val.expr]);
          })
        )]
      )]
    )
  );
}

//  `return <arg>;`
//    becomes
//  `return <array>[<array.length>] = <arg>;`
//
//  `return;`
//     becomes
//   `<array>.push(this); return;`
//
function pushReturnStatement(path, arrayId) {
  var returnStmt = path.node;
  n.ReturnStatement.assert(returnStmt);
  n.Pattern.assert(arrayId);
  if (returnStmt.argument) {
    returnStmt.argument = b.assignmentExpression(
      '=',
      b.memberExpression(
        arrayId,
        b.memberExpression(
          arrayId,
          i.length,
          false
        ),
        true
      ),
      returnStmt.argument
    );
  } else {
    var pushThis = pushThisStatement(arrayId);
    if (Array.isArray(path.parentPath.value)) {
      path.insertBefore(pushThisStatement(arrayId));
    } else {
      path.replace(b.blockStatement([pushThis, returnStmt]));
    }
  }
}

function create(regexp) {
  assert(util.isRegExp(regexp), 'regexp required');
  var hasAnnotation = require('./hasAnnotation')(regexp);

  return function(node) {
    types.visit(node, {
      visitFunctionDeclaration: function(path) {
        var node = path.node;
        if (hasAnnotation(node)) {

          var id = node.id;

          node.body.body.unshift(pushThisStatement(id));

          // strip name from function so it does not shadow the array variable
          var controllerFunc = b.functionExpression(
            null,
            node.params,
            node.body
          );

          var varDecl = variableDeclarationInitToEmptyArray(id);
          varDecl.comments = node.comments;

          path.replace(
            varDecl,
            replacementCode(
              addDirectiveSuffix(id.name),
              controllerFunc
            )
          );

          return false;
        }
        this.traverse(path);
      }
    });
  };
}

function createProxy(regexp) {
  assert(util.isRegExp(regexp), 'regexp required');
  var hasAnnotation = require('./hasAnnotation')(regexp);

  return function(node) {
    types.visit(node, {
      visitFunctionDeclaration: function(path) {
        var node = path.node;

        if (hasAnnotation(node)) {
          var id = node.id;

          // strip name from function so it does not shadow the array variable
          var controllerFunc = b.functionExpression(
            null,
            node.params,
            node.body
          );

          var varDecl = variableDeclarationInitToEmptyArray(id);
          varDecl.comments = node.comments;

          path.replace(
            varDecl,
            mockingCode(
              id.name,
              controllerFunc
            )
          );
          return false;
        }

        this.traverse(path);
      }
    });
  };
}

function mockingCode(name, func) {

  var injectorInvoke = b.expressionStatement(
    injectorInvokeExp(i.newController, b.thisExpression(), i.locals)
  );

  var wrapMockFunc = b.functionExpression(
    null,
    [i.$attrs, i.$element, i.$scope, i.$injector, i.$transclude],
    b.blockStatement([
      selfIsThis,
      pushStatement(b.identifier(name), i.self),
      localsStmt,
      createOriginalDecl,
      injectorInvoke
    ])
  );

  return replacementCode(addDirectiveSuffix(name), func, wrapMockFunc, true);
}

// <id>.push(this);
function pushThisStatement(id) {
  return pushStatement(id, b.thisExpression());
}

// <arrayId>.push(<valueId)
function pushExp(arrayId, valueId) {
  return b.callExpression(
    b.memberExpression(
      arrayId,
      i.push,
      false
    ),
    [valueId]
  );
}

function pushStatement(arrayId, valueId) {
  return b.expressionStatement(
    pushExp(arrayId, valueId)
  );
}

// var <id> = [];
function variableDeclarationInitToEmptyArray(id) {
  n.Identifier.assert(id);
  return b.variableDeclaration(
    'var',
    [b.variableDeclarator(
      id,
      b.arrayExpression([])
    )]
  );
}

function replacementCode(directiveName, newImplementation, implementationWrapper, copyProto) {

  assert('string' === typeof directiveName, 'directiveName must be a string');
  n.Function.assert(newImplementation);

  implementationWrapper = implementationWrapper || i.newController;

  // var newController = <newImplementation>
  var newControllerDecl = b.variableDeclaration(
      'var',
      [b.variableDeclarator(
        i.newController,
        newImplementation
      )]
  );

  // directive.controller = <implementationWrapper>
  var controllerAssignment = b.expressionStatement(
    b.assignmentExpression(
      '=',
      mDirectiveController,
      implementationWrapper
    )
  );

  // function($delegate) {
  //   var directive= $delegate[0];
  //   <controllerAssignment>
  //   return $delegate
  // }
  var stmts = [
    sDirectiveDeclare,
    sOldControllerDeclare,
    newControllerDecl,
    controllerAssignment
  ];
  if (copyProto) {
    stmts.push(sCopyPrototype);
  }
  stmts.push(b.returnStatement(i.$delegate));
  var decoratorCallback = b.functionExpression(null, [i.$delegate], b.blockStatement(stmts));

  // beforeEach(angular.mock.module(function($provide){
  //   $provide.decorator("<directiveName>", <decoratorCallback>);
  // }));
  return callStmt(
    i.beforeEach,
    [b.callExpression(
      mAngularMockModule,
      [callback(
        [i.$provide],
        [callStmt(m$provideDecorator, [b.literal(directiveName), decoratorCallback])]
      )]
    )]
  );
}

function callback(params, stmts) {
  return b.functionExpression(null, params, b.blockStatement(stmts));
}

function callStmt(callee, args) {
  return b.expressionStatement(b.callExpression(callee, args));
}

function addDirectiveSuffix(name) {
  var controllerSuffixRegExp = /Directive$/;
  if (name.match(controllerSuffixRegExp)) {
    return name;
  }
  return name + 'Directive';
}

// cached identifiers
var i = {};
[
  'angular',
  '$attrs',
  'beforeEach',
  '$controllerProvider',
  'controller',
  'decorator',
  '$delegate',
  'directive',
  '$element',
  'extend',
  'extendedLocals',
  '$injector',
  'invoke',
  'length',
  'locals',
  'mock',
  'module',
  'newController',
  '$oldController',
  'prototype',
  '$provide',
  'push',
  'register',
  'self',
  '$scope',
  '$super',
  '$transclude'
].forEach(function(value) {i[value] = b.identifier(value);});

// angular.mock
var mAngularMock = b.memberExpression(i.angular, i.mock, false);

// angular.mock.module
var mAngularMockModule = b.memberExpression(mAngularMock, i.module, false);

// $provide.decorator
var m$provideDecorator = b.memberExpression(i.$provide, i.decorator, false);

// $controllerProvider.register
var m$controllerProviderRegister = b.memberExpression(i.$controllerProvider, i.register, false);

// angular.extend;
var mAngularExtend = b.memberExpression(i.angular, i.extend, false);

// var directive = $delegate[0];
var sDirectiveDeclare = b.variableDeclaration(
  'var',
  [
    b.variableDeclarator(
      i.directive,
      b.memberExpression(i.$delegate, b.literal(0), true)
    )
  ]
);

// directive.controller
var mDirectiveController = b.memberExpression(
  i.directive,
  i.controller,
  false
);

// directive.controller.prototype
var mDirectiveControllerPrototype = b.memberExpression(
  mDirectiveController,
  i.prototype,
  false
);

// var $oldController = directive.controller
var sOldControllerDeclare = b.variableDeclaration(
  'var',
  [b.variableDeclarator(
    i.$oldController,
    mDirectiveController
  )]
);

// $oldController.prototype
var m$oldControlllerProtoype = b.memberExpression(
  i.$oldController,
  i.prototype,
  false
);

var sCopyPrototype = b.expressionStatement(b.assignmentExpression(
  '=',
  mDirectiveControllerPrototype,
  m$oldControlllerProtoype
));

// {
//   $attrs: $attrs,
//   $element: $element,
//   $scope: $scope,
//   $transclude: $transclude
// };
var localsExp = b.objectExpression(
  ['$attrs', '$element', '$scope', '$transclude', '$oldController', '$super']
    .map(function(val) {
      return b.property('init', i[val], i[val]);
    })
);

// var locals = <localsExp>
var localsStmt = b.variableDeclaration(
  'var',
  [b.variableDeclarator(i.locals, localsExp)]
);

// directive.controller.prototype

// angular.extend(arg0,arg2,...)
function ngExtendExp(args) {
  return b.callExpression(
    mAngularExtend,
    args
  );
}

// $injector.invoke(<func>, <context>, <locals>);
function injectorInvokeExp(func, contextExp, locals) {
  n.Expression.assert(locals);
  n.Expression.assert(func);
  n.Expression.assert(contextExp);
  return b.callExpression(
    b.memberExpression(
      i.$injector,
      i.invoke,
      false
    ),
    [func, contextExp, locals]
  );
}

// var $super = function(...);
var createOriginalDecl = b.functionDeclaration(
  i.$super,
  [i.extendedLocals],
  b.blockStatement([
    b.returnStatement(injectorInvokeExp(
      i.$oldController,
      i.self,
      ngExtendExp([
        b.objectExpression([]),
        i.locals,
        i.extendedLocals
      ])
    ))
  ])
);

// var self = this;
var selfIsThis = b.variableDeclaration(
  'var',
  [b.variableDeclarator(i.self, b.thisExpression())]
);
