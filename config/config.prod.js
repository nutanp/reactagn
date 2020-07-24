// requires
const _ = require('lodash');

// module variables
const config = require('./config.json');
const defaultConfig = config.prod;

console.log('config.prod.js file added ')


const finalConfig = config.prod;


console.log("finalConfig after merge , ",finalConfig);
// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;
//global.gConfig = environmentConfig;

// log global.gConfig
console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, 4)}`);
