'use strict';

const _ = require('lodash');
const historyService = require('../services/historyService');
const jsonService = require('../services/jsonService');
const parseArgs = require('../util/parseArgs');

module.exports = async function inspectAction (...args) {

  if (historyService.isEmpty) {
    throw new Error('Nothing to inspect; please make a transaction first.');
  }

  const {
    txnId = historyService.resolve(),
    full,
    filter
  } = parseArgs(args, {
    _: ['filter'],
    flag: ['full'],
    txnId: ['txnId']
  });

  const entry = historyService.get(txnId);
  const filtered = await jsonService.filter(entry, full, filter);

  if (filter) historyService.logFilter(filter);

  return {
    result: filtered,
    entries: [entry]
  };
};
