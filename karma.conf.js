module.exports = function(karma) {
  karma.set({
    frameworks: ['angular', 'mocha', 'sinon-chai'],

    files: [
      'build/messages.js',
      'build/messages-test.js'
    ],

    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    singleRun: true,
    autoWatch: false
  });
};
