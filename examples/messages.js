angular.module('messages', [])
  .provider('greet', function(){
    var salutation = 'hello';
    this.setSalutation = function (newSalutation) {
      salutation = newSalutation;
    };
    this.$get = function(punctuation) {
      return function(name) {
        return salutation + ' ' +  name + punctuation;
      };
    };
  })
  .value('punctuation', '!')
  .factory('hiFred', function(greet){
    return greet('Fred');
  })
  .service('multiGreet', function(greet){
    var count = 2;

    this.setCount = function(newCount) {
      count = newCount;
    };

    this.multiGreet = function(name){
      var arr = [];
      for(var i = 0; i < count; i++){
        arr.push(greet(name));
      }
      return arr;
    };
  })
  .directive('messageCollection', function($timeout){
    return {
      restict:'E',
      replace:true,
      template:'<div><div ng-transclude></div><div></div></div></div>',
      transclude:true,
      controller:function($timeout){
        var element;
        this.setElement = function(newElement){
          element = newElement;
        };
        this.appendMessage = function(msg){
          $timeout(function(){
            var child = angular.element(element.children()[1]);
            child.append(angular.element('<div>' + msg + '</div>'));
          });
        }
      },
      link: function postLink(scope, element, attrs, controller) {
        controller.setElement(element);
      }
    }
  })
  .directive('message', function() {
    return {
      restrict:'E',
      require:'^messageCollection',
      link: function postLink(scope, element, attrs, controller){
        controller.appendMessage(attrs.myMessage);
      }
    }
  });
