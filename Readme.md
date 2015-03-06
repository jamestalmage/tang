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

ng-test-utils offers a better way:

```javascript
module('myModule');

// @ngProvide
var serviceA = sinon.spy();

// @ngInject;
var serviceB, $rootScope, scope = $rootScope.$new();

// That's it - really!
```

ng-test-utils automatically generates the rest for you.

To get started, check out the plugins for.
[gulp](https://github.com/jamestalmage/gulp-angular-test-utils)
[browserify](https://github.com/jamestalmage/browserify-angular-test-utils)
and [karma](https://github.com/jamestalmage/karma-angular-test-utils)
