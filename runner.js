const { EventEmitter } = require('events');
const { uuidv4 } = require('./utils.js');

const emitter = new EventEmitter();

const handlers = new Map();

const stack = [];

const describe = (title, handler) => {
  emitter.emit('add:suite', { title, handler });
};

const it = (title, handler) => {
  emitter.emit('add:test', { title, handler });
};

emitter.on('add:suite', ({ title, handler }) => {
  const id = uuidv4();
  const parent = stack.length ? stack[stack.length - 1] : undefined;
  handlers.set(id, {
    id,
    type: 'suite',
    parent,
    children: [],
    title,
  });

  if (parent) {
    handlers.get(parent).children.push(id);
  }

  stack.push(id);
  handler();
  stack.pop();
});

emitter.on('add:test', ({ title, handler }) => {
  const id = uuidv4();
  const parent = stack.length ? stack[stack.length - 1] : undefined;
  if (parent) {
    handlers.get(parent).children.push(id);
  }
  handlers.set(id, {
    id,
    title,
    type: 'test',
    parent,
    handler,
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
