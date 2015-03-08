ng-test-utils
=============
Cleaner, less verbose tests for your Angular app!

[![Build Status](https://travis-ci.org/jamestalmage/angular-test-utils.svg?branch=master)](https://travis-ci.org/jamestalmage/angular-test-utils)
[![Coverage Status](https://coveralls.io/repos/jamestalmage/angular-test-utils/badge.svg?branch=master)](https://coveralls.io/r/jamestalmage/angular-test-utils?branch=master)


Angular is an amazing framework, but its dependency injection framework can lead to some pretty verbose tests:

```javascript
module('myModule');

var serviceA;

beforeEach(module(function() {
  serviceA = sinon.spy();
  $provide.value('serviceA', serviceA);
}));

var serviceB, $rootScope, scope;

beforeEach(inject(function(_serviceB_, _$rootScope_) {
  serviceB = _serviceB_;
  $rootScope = _$rootScope_;
  scope = $rootScope.$new();
}));

// Finally - I can start writing tests!!
```

All those `beforeEach` statements start to add up.
They clutter the top of all your test files, and distract from what's important.

`ng-test-utils` seeks to offer a better way:

```javascript
module('myModule');

// @ngProvide
var serviceA = sinon.spy();

// @ngInject;
var serviceB, $rootScope, scope = $rootScope.$new();

// That's it - really!
```

`ng-test-utils` automatically generates the rest for you through a series of ast transforms.

Better still, it includes comprehensive source-map support to help you easily identify exactly
where errors are being thrown in your code. It even plays nice with upstream transforms that supply
source-maps (i.e. coffee-script).

It includes a comprehensive tests suite (with 100% coverage), and has a thorough complement
of [plugins](#build-plugins) with examples that will help you fit it in to your build process.


@ngInject
---------
The `@ngInject` annotation allows you to inject instances from the Angular dependency injection framework
directly in to your tests with ease. Variable names are used to infer the instance name you want injected, so

```javascript
// @ngInject
var myService;
```

Will cause the "myService" instance from your module to be injected in to the test.
This injection is automatically wrapped in a `beforeEach` method call compatible with `mocha` or `jasmine`.

After `ng-test-utils` does its thing, the final code looks something like this.

```javascript
var myService;

beforeEach(inject(function(_myService_) {
  myService = _myService_;
}));
```

That's great, but let's say a significant portion of your tests are focused on a member of myService that
is a few layers deep: `myService.some.thing`. Ignore for a moment that such a structure is probably
a bad idea. This is easily accomplished my using `@ngInject` on a variable declaration that includes
an initialization.

```javascript
// @ngInject
var thing = myService.some.thing;
```
This will inject `myService` within a `beforeEach`, and assign the appropriate value to your variable.
The transformed code looks like this:

```javascript
var thing;

beforeEach(inject(function(myService) {
  thing = myService.some.thing;
}));
```

You could combine both approaches (giving your tests access to both `myService` and `thing` as follows:

```javascript
// @ngInject
var myService, thing = myService.some.thing;

// ---- becomes ----

var myService, thing;

beforeEach(inject(function(_myService_) {
  myService = _myService_;
  thing = myService.some.thing;
}));
```

You can even initialize variables with the results of method calls on injected items.

```javascript
// @ngInject
var scope = $rootScope.$new();

// ---- becomes ----

var scope;

beforeEach(inject(function($rootScope){
  scope = $rootScope.$new();
}));
```

@ngValue & ~~@ngProvide~~
-------------------------
Where `@ngInject` helps you get testable instances *out* of your angular module, `@ngValue`
provides a way to place spies or mocks *in* to the dependency injection framework. Variable names
are used to infer the name for the item being injected.

```javascript
// @ngValue
var myService = {
 doSomething: sinon.spy(),
 somethingElse: sinon.spy()
};

// ---- becomes ----

var myService;

beforeEach(module(function($provide){
  myService = {
    doSomething: sinon.spy(),
    somethingElse: sinon.spy()
  };
  $provide.value('myService', myService);
}));
```
`@ngProvide` works the same way and is synonymous with `@ngValue`, but I plan to repurpose it with slightly
different semantics - so stick with `@ngvalue` for now.

You can use both `@ngValue` and `@ngInject` together in your tests, but you must make sure all of your
`@ngValue` declarations come before your first `@ngInject`.

@ngConstant
-----------
Very similar to `@ngConstant`, but it provides a constant service. From the angular docs:

> Unlike a value [a constant] can be injected into a module configuration function (see angular.Module)
 and it cannot be overridden by an Angular decorator

```javascript
// @ngConstant
var siteUrl = 'https://angular.io';

// ---- becomes ----

var siteUrl;

beforeEach(module(function($provide){
  siteUrl = 'https://angular.io';
  $provide.constant('siteUrl', siteUrl);
}));
```

All your `@ngConstant` declarations must come before your first `@ngInject`.

@ngFactory
----------
Provides a way to inject mock services using Angulars factory style provider.
A factory function takes a list of injectables as arguments and returns a service.
When you place the `@ngFactory` annotation on a named function, it will be replaced
by a variable with that same name that is injected with the result of the factory
functions invocation.

```javascript
 // @ngFactory
function timeoutInSeconds($timeout) {
  return function(fn, delay, invokeApply) {
    return $timeout(fn, delay * 1000, invokeApply);
  };
}

// ---- becomes ----

var timeoutInSeconds;

beforeEach(function() {
  angular.mock.module(function($provide) {
    $provide.factory(function($timeout) {
      return timeoutInSeconds = function(fn, delay, invokeApply) {
        return $timeout(fn, delay * 1000, invokeApply);
      }
    });
  });
});
```

The above example could also be achieved by combining `@ngValue` and `@ngInject`.

```javascript
@ngValue
var timeoutInSeconds = function(fn, delay, invokeApply) {
  return $timeout(fn, delay, invokeApply);
}

@ngInject
var $timeout;
```
This will work in most cases, and has the added advantage of exposing $timeout to
your tests as well. Problems would arise if `timeoutInSeconds` were to be called
during module initialization before the `@ngInject` annotation has injected `$timeout`
in to your test. In that case `@ngFactory` is an acceptable workaround.

@ngService
----------
Very similar to `@ngFactory`, but rather than assigning the return value, it
uses the function as a constructor and injects the new instance.

```javascript
function myService(injectedDependency){
  this.foo = "bar";
}

// ----- becomes -----

var myService;

beforeEach(function() {
  angular.mock.module(function($provide) {
    $provide.service("myService" function(injectedDependency) {
      myService = this;
      this.foo = "bar";
    });
  });
});
```

Note - this currently does not work if you `return` a value from your constructor.
If that is the case you probably should be using `@ngFactory`.

source-maps
-----------
`ng-test-utils` uses [recast](https://github.com/benjamn/recast) to scan your code and inject all the
boilerplate required to make things work (it injects the `beforeEach` methods exactly as shown above).
However, modified javascript can create difficulties during the debug process if the line numbers displayed
when an Error gets thrown do not match the actual place in your code where it is happening. Fortunately,
`ng-test-utils` ships with full source-map support. Just make sure you enable source-maps
in your browsers developer tools, and enable source-map support from whichever plugin you
are using in your build.

build plugins
-------------
`ng-test-utils` has a number of companion plugins that help you insert it in your build process.
Each one has its own set of examples that will help get you started.

  * The [karma preprocessor](https://github.com/jamestalmage/karma-angular-test-utils) provides
  the simplest solution that will work for the majority of users. Since the transforms provided
  are entirely testing related, most users will not need anything beyond this.

  * The [browserify transform](https://github.com/jamestalmage/browserify-angular-test-utils),
  provides a way to perform the injections on code before it gets bundled by browserify.
  Combine with [karma-browserify](https://github.com/Nikku/karma-browserify) to test your
  CommonJS compatible angular modules.

  * The [gulp plugin](https://github.com/jamestalmage/gulp-angular-test-utils) provides a gulp compatible
   transform. Use gulps powerful streaming system to wire the transform up to any input/output stream you choose.


