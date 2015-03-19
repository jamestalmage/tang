module.exports.replace = create;
module.exports.proxy = createProxy;

var types = require('recast').types;
var n = types.namedTypes;
var b = types.builders;
var assert = require('assert');
var util = require('util');

function create(regexp) {
  assert(util.isRegExp(regexp), 'regexp required');
  var hasAnnotation = require('./hasAnnotation')(regexp);

  return function(node) {
    types.visit(node, {
      visitFunctionDeclaration: function(path) {
        var node = path.node;
        if (hasAnnotation(node)) {

          var id = node.id;

          path.get('body').get('body').unshift(pushThisStatement(id));

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

// <arrayId>.push(<valueId);
function pushStatement(arrayId, valueId) {
  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(
        arrayId,
        i.push,
        false
      ),
      [valueId]
    )
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

  // function($provide) {
  //   $provide.decorator("<directiveName>", <decoratorCallback>);
  // }
  var moduleCallback = b.functionExpression(null, [i.$provide],
    b.blockStatement([
      b.expressionStatement(
        b.callExpression(
          m$provideDecorator,
          [b.literal(directiveName), decoratorCallback]
        )
      )
    ])
  );

  // beforeEach(angular.mock.module(<moduleCallback>))
  return b.expressionStatement(
    b.callExpression(
      i.beforeEach,
      [b.callExpression(
        mAngularMockModule,
        [moduleCallback]
      )]
    )
  );
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
  'controller',
  'decorator',
  '$delegate',
  'directive',
  '$element',
  'extend',
  'extendedLocals',
  '$injector',
  'invoke',
  'locals',
  'mock',
  'module',
  'newController',
  '$oldController',
  'prototype',
  '$provide',
  'push',
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
