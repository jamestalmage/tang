ng-test-utils
=============
Cleaner, less verbose tests for your Angular app!

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

It includes a comprehensive tests suite (i.e. 100% coverage), and has a thorough complement
of plugins and examples that will help you easily fit it in to your build process.

To get started, check out the [karma preprocessor](https://github.com/jamestalmage/karma-angular-test-utils)
to start using it in your tests.
Browserify users should check out the [browserify transform](https://github.com/jamestalmage/browserify-angular-test-utils).
If neither of those work for your current build process, there is also a
[gulp plugin](https://github.com/jamestalmage/gulp-angular-test-utils) that can be adapted to nearly any build chain.

Each module contains its own set of examples that will help get you started.

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

@ngProvide
----------
Where `@ngInject` is useful for getting testable instances *out* of your angular module, `@ngProvide` gives
you a way to put spies or mocks *in* to the dependency injection framework. Again, the variable name is used to infer
the name for the item being injected.

```javascript
// @ngProvide
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

You can use both `@ngProvide` and `@ngInject` together in your tests, but you must make sure all of your
`@ngProvide` declarations come before `@ngInject`.

source-maps
-----------
`ng-test-utils` uses [recast](https://github.com/benjamn/recast) to scan your code and inject all the
boilerplate required to make things work (it injects the `beforeEach` methods exactly as shown above).
However, modified javascript can create difficulties during the debug process if the line numbers displayed
when an Error gets thrown do not match the actual place in your code where it is happening. Fortunately,
`ng-test-utils` ships with full source-map support. Just make sure you enable source-maps
in your browsers developer tools, and enable source-map support (see the individual plugins for more details
on how to do so).

plugins
-------
`ng-test-utils` has a number of companion plugins that help you insert it in your build process.

  * The [karma preprocessor](https://github.com/jamestalmage/karma-angular-test-utils) provides
  the simplest solution that will work for the majority of users. Since the transforms provided
  are entirely testing related, most users will not need anything beyond this.

  * The [browserify transform](https://github.com/jamestalmage/browserify-angular-test-utils),
  provides a way to perform the injections on code before it gets bundled by browserify.
  Combine with [karma-browserify](https://github.com/Nikku/karma-browserify) to test your
  CommonJS compatible angular modules.

  * The [gulp plugin](https://github.com/jamestalmage/gulp-angular-test-utils) provides a gulp compatible
   transform. Use gulps powerful streaming system to wire the transform up to any input/output stream you choose.

