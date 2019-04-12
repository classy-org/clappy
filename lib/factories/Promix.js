'use strict';

const _ = require('lodash');
const domain = require('domain');
const util = require('util');

/* -------------------------------------------------------------------------- *
 * Promix
 *
 * A Promise proxy that permits chaining with undefined methods (with the
 * expectation that the method will be defined by the time the callback is
 * executed).
 *
 * Every invocation is wrapped in a unique domain that references the domain
 * of the previous invocation on its chain, allowing the consumer to create
 * isolated promise chains without tracking the chain itself.
 * -------------------------------------------------------------------------- */

module.exports = class Promix {

  constructor (invoke, promise=Promise.resolve(), currDomain=domain.create()) {

    _.set(promise, '_promix.domain', currDomain);

    return new Proxy(promise, {

      get: (target, key, proxy) => {

        if (key === 'constructor') {
          return Promix;
        }

        if (key === util.inspect.custom) {
          return () => target;
        }

        if (key === Symbol.toPrimitive) {
          return () => true;
        }

        if (typeof target[key] === 'function') {
          return target[key].bind(target);
        }

        if (typeof target[key] !== 'undefined') {
          return target[key];
        }

        return (...args) => {
          const execDomain = domain.create();
          execDomain.parent = target._promix.domain;
          const action = execDomain.bind(() => invoke(key, args, proxy));
          return new Promix(invoke, target.then(action), execDomain);
        };
      }
    });
  }

  static isPromix (value) {
    return _.isObject(value) && value.constructor === Promix;
  }

};
