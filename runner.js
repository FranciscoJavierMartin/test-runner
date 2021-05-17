const { EventEmitter } = require('events');
const { uuidv4 } = require('./utils.js');

const emitter = new EventEmitter();

const handlers = new Map();

const describe = (title, handler) => {
  emitter.emit('add:suite', { title, handler });
};

const it = (title, handler) => {
  emitter.emit('add:test', { title, handler });
};

emitter.on('add:suite', ({ title, handler }) => {
  const id = uuidv4();
  handlers.set(id, {
    id,
    type: 'suite',
    title,
  });
  handler();
});

emitter.on('add:test', ({ title, handler }) => {
  const id = uuidv4();
  handlers.set(id, {
    id,
    title,
    type: 'test',
    handler
  });
  handler();
});

function run() {
  console.log(handlers);
}

module.exports = {
  describe,
  run,
  it,
};
