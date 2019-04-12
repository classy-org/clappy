'use strict';

const _ = require('lodash');
const CachedAction = require('../factories/CachedAction');
const historyService = require('../services/historyService');
const parseArgs = require('../util/parseArgs');
const state = require('../state');

module.exports = async function aliasAction (...args) {

  const {
    alias,
    extTarget,
    targetType,
    txnTarget
  } = parseArgs(args, {
    _: ['alias', 'extTarget'],
    pick: { targetType : ['command', 'filter', 'transaction'] },
    txnId: ['txnTarget']
  });

  if (!targetType) {
    throw new Error('Please provide a valid target type.');
  }

  if (!alias) {
    throw new Error('Please provide a valid alias.');
  }

  const isCommand = targetType === 'command';
  const isTransaction = targetType === 'transaction';
  const isFilter = targetType === 'filter';

  let target = (
      isTransaction ? txnTarget || historyService.resolve('current')
    : isFilter ? extTarget || historyService.latestFilter
    : isCommand ? wrapCommand(extTarget || historyService.latestCommand)
    : undefined
  );

  const destination = (
      isTransaction ? state.transactionAliases
    : isFilter ? state.filterAliases
    : isCommand ? state.commandAliases
    : undefined
  );

  _.set(destination, alias, target);

  return {
    notify: _.isFunction(target)
      ? `Saved ${targetType} alias "${alias}".`
      : `Saved ${targetType} alias "${alias}" targeting ${target}.`
  };
};

function wrapCommand (target) {
  if (_.isFunction(target)) {
    return new CachedAction(async (...args) => ({
      result: await target(...args)
    }));
  }
  return target;
}