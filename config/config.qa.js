// requires
const _ = require('lodash');

// module variables
const config = require('./config.json');
const defaultConfig = config.qa;

console.log('config.qa.js file added ')

// //const environment = process.env.env_config
// const environment = process.env.NODE_ENV

// const environmentConfig = config[environment]; 
// console.log("environmentConfig",environmentConfig);

// const finalConfig = _.merge(defaultConfig, environmentConfig);

const finalConfig = config.qa;


console.log("finalConfig after merge , ",finalConfig);
// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;
//global.gConfig = environmentConfig;

// log global.gConfig
console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, 4)}`);
