'use strict';

const _ = require('lodash');
const storeService = require('./services/storeService');
const util = require('util');

/* -------------------------------------------------------------------------- *
 * state
 *
 * In client, static, and script modes, functions as a simple dictionary of
 * values representing application state.
 *
 * In module mode, state also checks the active domain for a source of state
 * data, and proxies requests to that source rather than its internal source.
 * This allows the application to behave as though state is a singleton, even
 * though the data being manipulated may be specific to one chain of
 * commands.
 * -------------------------------------------------------------------------- */

module.exports = new Proxy({}, {
  get: (target, key) => {
    switch (key) {
      case util.inspect.custom:
        return () => storeService.active;
      default:
        return storeService.active[key];
    }
  },
  set: (target, key, value) => {
    storeService.active[key] = value;
    return true;
  },
  has: (target, key) => {
    return key in storeService.active;
  },
  ownKeys: (target) => {
    return Object.keys(storeService.active);
  },
  getOwnPropertyDescriptor: (target, key) => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});
