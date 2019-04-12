'use strict';

const _ = require('lodash');
const apiService = require('../services/apiService');
const historyService = require('../services/historyService');
const Promix = require('../factories/Promix');
const state = require('../state');

const GRANT_TYPES = {
  cc: 'client_credentials',
  pw: 'password'
};

const JSON_PATTERN = /^[\[\{].*[\}\]]$/i;

const TXN_DESC_PATTERN = /^(?:-?\d+|prev|current|this|next|latest)$/i;

const TYPE_HANDLERS = {

  flag: {
    find: ({ args, def }) => _.intersection(args, def),
    keys: ({ def }) => def,
    vals: ({ found, def }) => def.map(flag => found.includes(flag))
  },

  pick: {
    find: ({ args, def }) => _.intersection(args, _.flatten(_.values(def))),
    keys: ({ def }) => _.keys(def),
    vals: ({ found, def }) => _.values(def).map((opts) => (
      _(found).intersection(opts).first()
    ))
  },

  apiId: {
    find: ({ args }) => _.intersection(args, apiService.apiIds()),
    keys: ({ def }) => def,
    vals: ({ found }) => found
  },

  envId: {
    find: ({ args }) => _.intersection(args, apiService.envIds()),
    keys: ({ def }) => def,
    vals: ({ found }) => found
  },

  grantType: {
    find: ({ args }) => _.intersection(args, _.keys(GRANT_TYPES)),
    keys: ({ def }) => def,
    vals: ({ found }) => found.map(v => GRANT_TYPES[v])
  },

  txnId: {
    find: ({ args }) => _.filter(args, v => (
      TXN_DESC_PATTERN.test(v) || _.keys(state.transactionAliases).includes(v)
    )),
    keys: ({ def }) => def,
    vals: ({ found }) => found.map(v => historyService.resolve(v))
  },

  obj: {
    find: ({ args }) => _.filter(args, v => (
      JSON_PATTERN.test(v) || (_.isObject(v) && !Promix.isPromix(v))
    )),
    keys: ({ def }) => def,
    vals: ({ found }) => found.map(v => {
      if (_.isObject(v)) return v;
      try {
        return JSON.parse(v);
      } catch (err) {
        throw new Error('Could not parse JSON.');
      }
    })
  }
};


/* -------------------------------------------------------------------------- *
 * parseArgs()
 * -------------------------------------------------------------------------- */

module.exports = function parseArgs (userArgs, defs) {

  function classify ([ args, classified ], def, type) {
    if (type === '_') {
      return [ args, classified ];
    }
    const handler = TYPE_HANDLERS[type];
    const found = handler.find({ args, def });
    const keys = handler.keys({ found, def });
    const vals = handler.vals({ found, def });
    const remaining = _.without(args, ...found);
    classified.push([keys, vals]);
    return [ remaining, classified ];
  }

  const [ unclassified, classified ] = _.reduce(defs, classify, [userArgs, []]);

  if (defs._) {
    classified.push([defs._, _.reject(unclassified, Promix.isPromix)]);
  }

  return _(classified).map(arr => _.zipObject(...arr)).reduce(_.assign);

}
