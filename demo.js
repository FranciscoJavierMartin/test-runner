const demand = require('must');
const { describe, it, run } = require('./runner.js');

describe('demo top level', () => {
  describe('demo nested', () => {
    it('works', () => {
      demand('foo').to.eql('foo');
    });
  });
});

describe('demo 2', () => {
  it('works', () => {
    demand('fooo').to.eql('foo');
  });
});
