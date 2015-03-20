describe('ngController', function() {

  describe('works if controller does not return anything', function() {
    beforeEach(module(angular.module('ngController.noReturn', []).name));

    // @ngController
    function myCtrl($attrs){
      this.name = $attrs.name;
    }

    // @ngInject
    var $compile, $rootScope;

    it('', function() {
      $compile('<div ng-controller="myCtrl" name="hello"></div><div ng-controller="myCtrl" name="goodbye"></div>')($rootScope);
      $rootScope.$apply();
      expect(myCtrl.length).to.equal(2);
      expect(myCtrl[0].name).to.equal('hello');
      expect(myCtrl[1].name).to.equal('goodbye');
    });
  });

  describe('works if controller returns explicit value ', function() {
    beforeEach(module(angular.module('ngController.explicitReturn', []).name));

    // @ngController
    function myCtrl($attrs){
      return {name: $attrs.name};
    }

    // @ngInject
    var $compile, $rootScope;

    it('', function() {
      $compile('<div ng-controller="myCtrl" name="hello"></div><div ng-controller="myCtrl" name="goodbye"></div>')($rootScope);
      $rootScope.$apply();
      expect(myCtrl.length).to.equal(2);
      expect(myCtrl[0].name).to.equal('hello');
      expect(myCtrl[1].name).to.equal('goodbye');
    });
  });

  describe('works if controller returns explicit value as member of if statement', function() {
    beforeEach(module(angular.module('ngController.ifReturn', []).name));

    // @ngController
    function myCtrl($attrs){
      this.name = $attrs.name;
      if($attrs.name === 'this') return;
      if($attrs.name === 'hello') return {name:'howdy'};
      if($attrs.name === 'goodbye') return {name:'bye'};
    }

    // @ngInject
    var $compile, $rootScope;

    it('', function() {
      $compile(
        '<div ng-controller="myCtrl" name="hello"></div>' +
        '<div ng-controller="myCtrl" name="goodbye"></div>' +
        '<div ng-controller="myCtrl" name="this"></div>'
      )($rootScope);
      $rootScope.$apply();
      expect(myCtrl.length).to.equal(3);
      expect(myCtrl[0].name).to.equal('howdy');
      expect(myCtrl[1].name).to.equal('bye');
      expect(myCtrl[2].name).to.equal('this');
    });
  });

  describe('works using assignment and sinon.spy()', function() {
    beforeEach(module(angular.module('ngController.assignSinonSpy', []).name));

    // @ngController
    var myCtrl = ['$attrs', sinon.spy()];

    // @ngInject
    var $compile, $rootScope;

    it('', function() {
      $compile(
        '<div ng-controller="myCtrl" name="hello"></div>' +
        '<div ng-controller="myCtrl" name="goodbye"></div>'
      )($rootScope);
      $rootScope.$apply();
      expect(myCtrl[1].callCount).to.equal(2);
      expect(myCtrl[1]).to.have.been.calledWith(sinon.match({name:"hello"}));
      expect(myCtrl[1]).to.have.been.calledWith(sinon.match({name:"goodbye"}));
    });
  });
});
