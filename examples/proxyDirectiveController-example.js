describe('proxyDirectiveController', function(){
  'use strict';
  var moduleName = 'example.proxyDirectiveController';
  var pdce = angular.module(moduleName, []);

  pdce.directive('noTransclusion', function(){
    return {
      template:'<span>Hello {{name}}</span>',
      controller:function(log, $attrs){
        log('noTransclusion:' + $attrs.name);
      }
    };
  });

  describe('works without transclusion', function() {
    beforeEach(module(moduleName));

    // @proxyDirectiveController
    function noTransclusion($super, $transclude){
      $super();
      expect($transclude).to.equal(undefined);
    }

    // @ngValue
    var log = (function(){
      var arr = [];
      function doLog(){
        arr.push.apply(arr,arguments);
      }
      doLog.toString = function(){return arr.join('; ');};
      return doLog;
    })();

    // @ngInject
    var $rootScope, $compile;

    it('', function() {
      var rel = $compile('<no-transclusion name="World"></no-transclusion>')($rootScope);
      $rootScope.$apply();
      expect(log.toString()).to.equal('noTransclusion:World');
    });

  });



});