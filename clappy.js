'use strict';

const _ = require('lodash');
const fs = require('fs');
const os = require('os');
const path = require('path');
const presets = require('./lib/presets');
const runAsChain = require('./lib/runners/runAsChain');
const runAsQueue = require('./lib/runners/runAsQueue');
const storeService = require('./lib/services/storeService');
const ttyService = require('./lib/services/ttyService');
const {
  config: confPath,
  prod: enableProdModifications,
  _: args
} = require('yargs').argv;


/* -------------------------------------------------------------------------- *
 * Apply modprod flag (enables modification of resources in prod)
 * -------------------------------------------------------------------------- */

storeService.assign({ enableProdModifications });


/* -------------------------------------------------------------------------- *
 * Set up execution context
 * -------------------------------------------------------------------------- */

const isBinary = Boolean(process.pkg);
const isModule = require.main !== module;
const isTTY = require.main === module;
const mode = (
    isModule ? 'module'
  : _.isEmpty(args) ? 'client'
  : isBinary && fs.existsSync(args[0]) ? 'script'
  : 'static'
);

storeService.assign({ context: { isBinary, isModule, isTTY, mode } });


/* -------------------------------------------------------------------------- *
 * Find and apply user config, if applicable
 * -------------------------------------------------------------------------- */

const userConf = confPath && path.resolve(confPath);
const homeConf = path.resolve(os.homedir(), 'clappy.config.js');
const configFn = (
    isModule ? () => {}
  : fs.existsSync(userConf) ? require(userConf)
  : fs.existsSync(homeConf) ? require(homeConf)
  : () => {}
);

storeService.assign(configFn(presets));


/* -------------------------------------------------------------------------- *
 * Kick off appropriate runner for mode
 * -------------------------------------------------------------------------- */

switch (mode) {

  case 'module':
    module.exports = function Clappy (chainConfigFn=()=>({})) {
      return runAsChain(chainConfigFn(presets));
    };
    break;

  case 'client':
    console.clear();
    ttyService.loop(runAsQueue);
    break;

  case 'script':
    const programPath = args[0];
    const program = _(fs.readFileSync(programPath, 'utf8'))
      .split('\n')
      .map(_.trim)
      .filter(line => !_.startsWith(line, '#'))
      .join('\n');
    runAsQueue(program);
    break;

  case 'static':
    runAsQueue(args[0]);
    break;
}
