'use strict';

const actions = require('../actions');
const parseProgram = require('../util/parseProgram');
const historyService = require('../services/historyService');
const state = require('../state');
const ttyService = require('../services/ttyService');

/* -------------------------------------------------------------------------- *
 * runAsQueue
 *
 * Executes a "program" of commands in sequence. If runOnce is true, exits
 * process with appropriate exit code.
 * -------------------------------------------------------------------------- */

module.exports = async function runAsQueue (program, runOnce=true) {

  try {

    const queue = parseProgram(program);
    const isCompound = queue.length > 1;

    for (let i = 0; i < queue.length; i++) {

      const cmdArr = queue[i];
      const [action, ...args] = cmdArr;
      const cmdStr = cmdArr.join(' ');
      const cmdId = i + 1;
      const isLast = cmdId === queue.length;

      if (isCompound && state.context.mode === 'client') {
        ttyService.output({
          progress: `[${cmdId} of ${queue.length}] ${cmdStr}`
        });
      }

      if (action in actions) {
        const result = await actions[action](...args);
        if (isLast) ttyService.output(result);
        historyService.logCommand(cmdStr);
        continue;
      }

      throw new Error(`Command ${action} not recognized.`);

    }

    if (runOnce) {
      process.exit(0);
    }

  } catch (err) {

    if (runOnce) {
      console.error(err);
      process.exit(1);
    }

    throw err;
  }
};
