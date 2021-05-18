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
    depth: stack.length,
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
    depth: stack.length,
    type: 'test',
    parent,
    handler,
  });
  handler();
});

function run() {
  const rootSuites = Array.from(handlers).reduce((acc, curr) => {
    return curr[1].parent === undefined ? [...acc, curr[0]] : acc;
  }, []);

  async function runSuites(ids) {
    for (const id of ids) {
      const suiteOrTest = handlers.get(id);

      if (suiteOrTest.type === 'suite') {
        console.log(suiteOrTest.title);
        runSuites(suiteOrTest.children);
      }

      if (suiteOrTest.type === 'test') {
        console.log(suiteOrTest.title);
        suiteOrTest.handler();
      }
    }
  }

  runSuites(rootSuites);
}

module.exports = {
  describe,
  run,
  it,
};
