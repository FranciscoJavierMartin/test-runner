const path = require('path');
const { run } = require('./runner');

const specs = process.argv.slice(2);

for (const spec of specs) {
  require(path.resolve(spec));
}

run();