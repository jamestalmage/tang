ng-test-utils
-------------
Cleaner, less verbose tests for your angular app!

Angular is an amazing framework, but it's dependency injection framework can lead to some pretty verbose tests:

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

ng-test-utils seeks to offer a better way:

```javascript
module('myModule');

// @ngProvide
var serviceA = sinon.spy();

// @ngInject;
var serviceB, $rootScope, scope = $rootScope.$new();

// That's it - really!
```

ng-test-utils automatically generates the rest for you through a series of ast transforms.

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

Each module contains it's own set of examples that will help get you started.
