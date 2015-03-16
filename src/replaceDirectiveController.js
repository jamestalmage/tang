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
    injectorInvokeExp(inewController, b.thisExpression(), ilocals)
  );

  var wrapMockFunc = b.functionExpression(
    null,
    [i$attrs, i$element, i$scope, i$injector, i$transclude],
    b.blockStatement([
      selfIsThis,
      pushStatement(b.identifier(name), iself),
      localsStmt,
      createOriginalDecl,
      injectorInvoke
    ])
  );

  return replacementCode(addDirectiveSuffix(name), func, wrapMockFunc);
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
        ipush,
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

function replacementCode(directiveName,
                         newImplementation,
                         implementationWrapper) {

  assert('string' === typeof directiveName, 'directiveName must be a string');
  n.Function.assert(newImplementation);

  implementationWrapper = implementationWrapper || inewController;

  // var newController = <newImplementation>
  var newControllerDecl = b.variableDeclaration(
      'var',
      [b.variableDeclarator(
        inewController,
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
  var decoratorCallback = b.functionExpression(null, [i$delegate],
    b.blockStatement([
      sDirectiveDeclare,
      sOldControllerDeclare,
      newControllerDecl,
      controllerAssignment,
      b.returnStatement(i$delegate)
    ])
  );

  // function($provide) {
  //   $provide.decorator("<directiveName>", <decoratorCallback>);
  // }
  var moduleCallback = b.functionExpression(null, [i$provide],
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
      ibeforeEach,
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
var idirective   = b.identifier('directive');
var i$delegate   = b.identifier('$delegate');
var icontroller  = b.identifier('controller');
var i$provide    = b.identifier('$provide');
var iangular     = b.identifier('angular');
var iextend      = b.identifier('extend');
var imock        = b.identifier('mock');
var imodule      = b.identifier('module');
var ibeforeEach  = b.identifier('beforeEach');
var idecorator   = b.identifier('decorator');
var ipush        = b.identifier('push');
var i$scope      = b.identifier('$scope');
var i$element    = b.identifier('$element');
var i$attrs      = b.identifier('$attrs');
var i$transclude = b.identifier('$transclude');
var i$injector   = b.identifier('$injector');
var iinvoke      = b.identifier('invoke');
var iself        = b.identifier('self');
var ilocals      = b.identifier('locals');
var iextendedLocals      = b.identifier('extendedLocals');
var i$oldController = b.identifier('$oldController');
var inewController = b.identifier('newController');
var i$super = b.identifier('$super');

// angular.mock
var mAngularMock = b.memberExpression(iangular, imock, false);

// angular.mock.module
var mAngularMockModule = b.memberExpression(mAngularMock, imodule, false);

// $provide.decorator
var m$provideDecorator = b.memberExpression(i$provide, idecorator, false);

// angular.extend;
var mAngularExtend = b.memberExpression(iangular, iextend, false);

// var directive = $delegate[0];
var sDirectiveDeclare = b.variableDeclaration(
  'var',
  [
    b.variableDeclarator(
      idirective,
      b.memberExpression(i$delegate, b.literal(0), true)
    )
  ]
);

// directive.controller
var mDirectiveController = b.memberExpression(
  idirective,
  icontroller,
  false
);

var sOldControllerDeclare = b.variableDeclaration(
  'var',
  [b.variableDeclarator(
    i$oldController,
    mDirectiveController
  )]
);

// {
//   $attrs: $attrs,
//   $element: $element,
//   $scope: $scope,
//   $transclude: $transclude
// };
var localsExp = b.objectExpression([
  b.property('init', i$attrs, i$attrs),
  b.property('init', i$element, i$element),
  b.property('init', i$scope, i$scope),
  b.property('init', i$transclude, i$transclude),
  b.property('init', i$oldController, i$oldController),
  b.property('init', i$super, i$super)
]);

// var locals = <localsExp>
var localsStmt = b.variableDeclaration(
  'var',
  [b.variableDeclarator(ilocals, localsExp)]
);

// angular.extend(arg0,arg2,...)
function ngExtendExp(args) {
  return b.callExpression(
    mAngularExtend,
    args
  );
}

function injectorInvokeExp(func, contextExp, locals) {
  n.Expression.assert(locals);
  n.Expression.assert(func);
  n.Expression.assert(contextExp);
  return b.callExpression(
    b.memberExpression(
      i$injector,
      iinvoke,
      false
    ),
    [func, contextExp, locals]
  );
}

var createOriginalDecl = b.functionDeclaration(
  i$super,
  [iextendedLocals],
  b.blockStatement(
    [b.returnStatement(
      injectorInvokeExp(
        i$oldController,
        iself,
        ngExtendExp([
          b.objectExpression([]),
          iextendedLocals,
          ilocals
        ])
      )
    )]
  )
);

var selfIsThis = b.variableDeclaration(
  'var',
  [b.variableDeclarator(iself, b.thisExpression())]
);
