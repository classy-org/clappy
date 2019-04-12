'use strict';

const _ = require('lodash');
const CachedAction = require('./CachedAction');
const defaults = require('../../defaults');

const APPLY = Symbol('Store.apply');

/* -------------------------------------------------------------------------- *
 * Store
 *
 * The raw state data that is created, cloned, and pointed to by the state
 * module.
 * -------------------------------------------------------------------------- */

class Store {

  constructor (config) {
    this[APPLY](defaults);
    this[APPLY](config);
    this.apiId = null;
    this.envId = null;
    this.grantType = null;
    this.index = -1;
    this.apiCache = {};
    this.apiTokens = {};
    this.commandLog = [];
    this.filterLog = [];
    this.transactionAliases = {};
    this.transactionLog = [];
  }

  /* ------------------------------------------------------------------------ *
   * Symbol(Store.apply)
   *
   * Applies configuration settings to the rootState.
   * ------------------------------------------------------------------------ */

  [APPLY] (config={}) {

    // Avoid mutation
    const cloned = _.cloneDeep(config);

    // Filter and normalize commandAliases. In TTY mode, aliased actions must
    // be strings. In module mode, they must be instances of CachedAction.
    cloned.commandAliases = _.transform(
      cloned.commandAliases,
      (acc, action, alias) => {
        if (this.context.isTTY && _.isString(action)) {
          acc[alias] = action;
        }
        if (this.context.isModule && _.isFunction(action)) {
          acc[alias] = new CachedAction(async (...args) => ({
            result: await action(...args)
          }));
        }
      },
      {}
    );

    // Merge into self; concatenate arrays
    _.mergeWith(this, cloned, (val1, val2) => {
      if (_.isArray(val1) && _.isArray(val2)) {
        return val1.concat(val2);
      }
    });

    // Return self for chaining
    return this;
  }
}

Store.apply = APPLY;

module.exports = Store;
