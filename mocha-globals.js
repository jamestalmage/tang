var chai = require('chai'),
  sinonChai = require("sinon-chai"),
  recast = require('recast');

global.expect = chai.expect;
global.sinon = require('sinon');
global.lib = require('./test/lib');
global.recast = recast;
global.types = recast.types;
global.n = types.namedTypes;
global.b = types.builders;
chai.use(sinonChai);