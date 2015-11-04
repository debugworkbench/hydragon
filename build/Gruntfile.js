// get ts-node to transpile any TypeScript source files passed to require()
require('ts-node').register();
// transpile the actual Grunt config and export the result
module.exports = require('./grunt-config.ts');
