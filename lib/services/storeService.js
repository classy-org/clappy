'use strict';

const _ = require('lodash');
const domain = require('domain');
const Store = require('../factories/Store');

class StoreService {

  /* ------------------------------------------------------------------------ *
   * constructor
   *
   * All stores "inherit" from the rootStore.
   * ------------------------------------------------------------------------ */

  constructor () {
    this.rootStore = new Store();
  }

  /* ------------------------------------------------------------------------ *
   * active
   *
   * Returns the store for the current context. For TTY modes, this is always
   * the rootStore.
   * ------------------------------------------------------------------------ */

  get active () {
    return _.get(domain, 'active.store', this.rootStore);
  }

  /* ------------------------------------------------------------------------ *
   * previous
   *
   * If running in module mode, returns the store used by the previous "link"
   * in the chain if it exists; otherwise null.
   * ------------------------------------------------------------------------ */

  get previous () {
    return _.get(domain, 'active.parent.store', null);
  }

  /* ------------------------------------------------------------------------ *
   * create
   *
   * Like Object.create, generates a new store based on an existing store,
   * optionally with additional user overrides. Overrides must be merged in
   * using Store.apply so that arrays are concatenated and transactionAliases
   * are normalized.
   * ------------------------------------------------------------------------ */

  create (store, overrides={}) {
    return _.merge(new Store(), store)[Store.apply](overrides);
  }

  /* ------------------------------------------------------------------------ *
   * assign
   *
   * Like Object.assign, merges in config options using Store.apply, so that
   * arrays are concatenated and transactionAliases are normalized.
   * ------------------------------------------------------------------------ */

  assign (overrides={}) {
    return this.active[Store.apply](overrides);
  }

  /* ------------------------------------------------------------------------ *
   * setActive
   *
   * Sets the store for the current context.
   * ------------------------------------------------------------------------ */

  setActive (store) {
    _.set(domain, 'active.store', store);
  }

}

module.exports = new StoreService();
