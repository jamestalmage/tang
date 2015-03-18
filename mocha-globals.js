var chai = require('chai'),
  sinonChai = require("sinon-chai");

global.expect = chai.expect;
global.sinon = require('sinon');
global.lib = require('./test/lib');
chai.use(sinonChai);