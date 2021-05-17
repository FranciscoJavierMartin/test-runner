const { EventEmitter } = require('events');

const describe = (title, handler) => {
  console.log(title);
  handler();
};

const it = (title, handler) => {
  console.log(title);
  handler();
};

module.exports = {
  describe,
  it,
};
