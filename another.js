const demand = require('must');
const { describe, it, run } = require('./runner');

describe('object comparison', () => {
  it('fails with property mismatch', () => {
    demand({ foo: 'bar' }).to.eql({ foo: 'qux' });
  });

  it('fails with missing property', () => {
    demand({ foo: 'foo', bar: 'bar' }).to.eql({ foo: 'foo' });
  });
});
