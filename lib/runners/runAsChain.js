'use strict';

const _ = require('lodash');
const actions = require('../actions');
const CachedAction = require('../factories/CachedAction');
const historyService = require('../services/historyService');
const Promix = require('../factories/Promix');
const state = require('../state');
const storeService = require('../services/storeService');

/* -------------------------------------------------------------------------- *
 * runAsChain
 *
 * Creates the initial Promix that allows commands to be chained in module
 * mode. The invocation function passed to the Promix ensures that state is
 * backed by the proper data store, locates the proper action, splices in
 * user args, logs the command, and returns the result.
 * -------------------------------------------------------------------------- */

module.exports = function runAsChain (config) {

  // Set up a new root store for this chain, with config options merged in.
  const chainRootStore = storeService.create(storeService.active, config);

  // Wrap native actions in CachedAction objects to enable arg splicing.
  const nativeActions = _.mapValues(actions, (fn => new CachedAction(fn)));

  // Define invocation function that is used for each chained command.
  async function invoke (key, args, inst) {

    // Ensure this invocation uses the proper store data.
    const prevStore = storeService.previous || chainRootStore;

    // fork() module-only method: creates a new, isolated chain
    if (key === 'fork') {
      storeService.setActive(storeService.create(prevStore));
      return;
    } else {
      storeService.setActive(prevStore);
    }

    // Locate action. Because we have set up our store, we can now call state
    // directly.
    const action = state.commandAliases[key] || nativeActions[key];
    if (!action) {
      throw new Error(`Sorry, ${key} is not a valid method.`);
    }

    // Splice args and execute.
    const { fn, capturedArgs } = action;
    const execArgs = [...capturedArgs, ...args];
    const output = await fn(inst, ...execArgs);

    // Log command.
    historyService.logCommand(new CachedAction(fn, execArgs));

    // Resolve with output.
    return output.result;

  };

  return new Promix(invoke);
}
