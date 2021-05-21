const { EventEmitter } = require('events');
const chalk = require('chalk');
const { uuidv4 } = require('./utils.js');

const emitter = new EventEmitter();

const handlers = new Map();

const stack = [];

const pass = chalk.green('✔');
const fail = chalk.red('𐄂');

function reporterDescribe(suiteOrTest) {
  const depth = '  '.repeat(suiteOrTest.depth);
  if(suiteOrTest.depth === 0){
    console.log()
  }
  console.log(`${depth}${suiteOrTest.title}`);
}

function reporterTest(suiteOrTest) {
  const depth = '  '.repeat(suiteOrTest.depth);
  const symbol = suiteOrTest.result.pass ? pass : fail;
  console.log(`${depth}${symbol} ${suiteOrTest.title}`);
}

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
    result: {
      pass: true,
    },
    depth: stack.length,
    type: 'test',
    parent,
    handler,
  });
});

function run() {
  const rootSuites = Array.from(handlers).reduce((acc, curr) => {
    return curr[1].parent === undefined ? [...acc, curr[0]] : acc;
  }, []);

  const summaries = [];

  function printSummary() {
    console.log();
    for (const sum of summaries) {
      const fail = chalk.red('FAIL');
      console.log(`${fail} ${sum.title}`);
      console.log(sum.result.message);
    }
  }

  async function runSuites(ids) {
    for (const id of ids) {
      const suiteOrTest = handlers.get(id);

      if (suiteOrTest.type === 'suite') {
        reporterDescribe(suiteOrTest);
        runSuites(suiteOrTest.children);
      }

      if (suiteOrTest.type === 'test') {
        try {
          suiteOrTest.handler();
        } catch (e) {
          if (e.name === 'AssertionError') {
            suiteOrTest.result = {
              pass: false,
              message: ` Expected: ${JSON.stringify(
                e.expected
              )}.\n Actual: ${JSON.stringify(e.actual)}`,
            };
          }
        } finally {
          reporterTest(suiteOrTest);
          if (!suiteOrTest.result.pass) {
            summaries.push({
              title: suiteOrTest.title,
              result: suiteOrTest.result,
            });
          }
        }
      }

      handlers.delete(suiteOrTest.id);

      if (handlers.size === 0) {
        printSummary();
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
