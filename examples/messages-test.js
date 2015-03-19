describe('messages', function() {
  beforeEach(module('messages'));

  describe('defaultBehavior', function() {
    // @ngInject
    var greet, hiFred, multiGreet;

    it('greet', function() {
      expect(greet('James')).to.equal('hello James!');
    });

    it('hiFred', function() {
      expect(hiFred).to.equal('hello Fred!')
    });

    it('multiGreet', function() {
      expect(multiGreet.multiGreet('James')).to.eql([
        'hello James!',
        'hello James!'
      ]);

      multiGreet.setCount(3);

      expect(multiGreet.multiGreet('Fred')).to.eql([
        'hello Fred!',
        'hello Fred!',
        'hello Fred!'
      ]);
    });
  });

  describe('use @ngValue to override punctuation', function() {
    // @ngValue
    var punctuation = '?';

    // @ngInject
    var greet;

    it('greet', function() {
      expect(greet('James')).to.equal('hello James?');
    });
  });

  describe('use @ngInjectProvider to override provider', function() {
    // @ngInjectProvider
    var greetProvider;

    // @ngInject
    var greet;

    it('blah', function() {
      greetProvider.setSalutation('howdy');
      expect(greet('James')).to.equal('howdy James!');
    });
  });

  describe('use @ngProvider to override the provider', function() {
    // @ngProvider
    var greetProvider = {
      $get: function() {return function(name) {return 'yo ' + name;}},
      setSalutation: sinon.spy()
    };

    // @ngInject
    var greet;

    it('greet is overridden', function() {
      expect(greet('dude')).to.equal('yo dude');
    });
  });

  describe('messageCollection directive - basic operation', function() {
    // @ngInject
    var scope = $rootScope.$new()
      , $timeout
      , $el = $compile('<message-collection><message my-message="hello"></message></message-collection>')(scope);

    it('test', function() {
      scope.$apply();
      $timeout.flush();
      var child = angular.element($el.children()[1]);
      expect(child.html()).to.equal('<div>hello</div>');
    });
  });

  describe('messageCollection replacing', function() {
    // @replaceDirectiveController
    function messageCollection() {
      this.setElement = sinon.spy();
      this.appendMessage = sinon.spy();
    }

    // @ngInject
    var scope = $rootScope.$new()
      , $compile;

    it('test', function() {
      $compile('<message-collection><message my-message="hello"></message></message-collection>')(scope);
      scope.$apply();
      expect(messageCollection.length).to.equal(1);
      expect(messageCollection[0].appendMessage).to.have.been.calledOnce.and.calledWith('hello');
      expect(messageCollection[0].setElement.called).to.equal(true);
    });
  });

  describe('$injector.instantiate', function(){
    // @ngInject
    var $injector;

    it('test', function() {
      var s = sinon.spy();

      var val = $injector.instantiate(function($injector) {
        return $injector.instantiate(function() {
          this.a = sinon.spy();
          this.b = sinon.spy();
        })
      });

      val.a();
      val.b();

    });

  });

  describe('@mockDirectiveController', function() {
    describe('allows you to override methods', function() {
      // @proxyDirectiveController
      function messageCollection() {
        this.setElement = sinon.spy();
        this.appendMessage = sinon.spy();
      }

      // @ngInject
      var scope = $rootScope.$new()
        , $compile;

      it('', function() {
        $compile('<message-collection><message my-message="hello"></message></message-collection>')(scope);
        scope.$apply();
        expect(messageCollection.length).to.equal(1);
        expect(messageCollection[0].appendMessage).to.have.been.calledOnce.and.calledWith('hello');
        expect(messageCollection[0].setElement.called).to.equal(true);
      });
    });

    describe('$super - allows you to invoke the overridden constructor', function() {
      var log = [];

      // @proxyDirectiveController
      function messageCollection($super) {
        this.setElement = sinon.spy();
        this.appendMessage = sinon.spy();
        expect(this.name).to.equal('mcc_proto');
        $super();
        expect(this.name).to.equal('mcc_const:bar');
        log.push('done');
      }

      // @ngInject
      var scope = $rootScope.$new()
        , $compile;

      it('', function() {
        $compile('<message-collection name="bar"><message my-message="hello"></message></message-collection>')(scope);
        scope.$apply();
        expect(log).to.eql(['done']);
      });
    });

    describe('$super - allows you to override locals', function () {
      var log = [];

      // @proxyDirectiveController
      function messageCollection($super) {
        this.setElement = sinon.spy();
        this.appendMessage = sinon.spy();
        expect(this.name).to.equal('mcc_proto');
        $super({$attrs:{name:'foo'}});
        expect(this.name).to.equal('mcc_const:foo');
        log.push('done');
      }

      // @ngInject
      var scope = $rootScope.$new()
        , $compile;

      it('', function () {
        $compile('<message-collection name="bar"><message my-message="hello"></message></message-collection>')(scope);
        scope.$apply();
        expect(log).to.eql(['done']);
      });
    });
  });
});
