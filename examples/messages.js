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
  .directive('messageCollection', function() {
    function MessageCollectionController($timeout, $attrs){
      this.name = 'mcc_const' + ($attrs.name ? ':' + $attrs.name : '');
      this._$timeout = $timeout
    }
    var mp = MessageCollectionController.prototype;
    mp.name = 'mcc_proto';
    mp.setElement = function(newElement) {
      this._element = newElement;
    };
    mp.appendMessage = function(msg) {
      var self = this;
      this._$timeout(function(){
        var child = angular.element(self._element.children()[1]);
        child.append(angular.element('<div>' + msg + '</div>'));
      });
    };

    return {
      restict:'E',
      replace:true,
      template:'<div><div ng-transclude></div><div></div></div></div>',
      transclude:true,
      controller: MessageCollectionController,
      link: function postLink(scope, element, attrs, controller) {
        controller.setElement(element);
      }
    };
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
