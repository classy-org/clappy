'use strict';

const historyService = require('../services/historyService');
const jsonService = require('../services/jsonService');
const parseArgs = require('../util/parseArgs');
const state = require('../state');

module.exports = async function diffAction (...args) {

  if (historyService.isEmpty) {
    throw new Error('Nothing to diff; please make at least two transactions first.');
  }

  if (historyService.length === 1) {
    throw new Error('Nothing to diff; please make another transaction first.');
  }

  const {
    fromId = historyService.resolve('prev'),
    toId = historyService.resolve('current'),
    full,
    filter
  } = parseArgs(args, {
    _: ['filter'],
    flag: ['full'],
    txnId: ['fromId', 'toId']
  });

  if (toId === fromId) {
    throw new Error('Cannot diff transaction with itself.');
  }

  const fromEntry = historyService.get(fromId);
  const toEntry = historyService.get(toId);

  const fromFiltered = await jsonService.filter(fromEntry, full, filter);
  const toFiltered = await jsonService.filter(toEntry, full, filter);

  if (filter) historyService.logFilter(filter);
  
  if (state.context.mode === 'module') {
    return {
      result: jsonService.diff(fromFiltered, toFiltered),
      entries: [fromEntry, toEntry]
    };
  }
  else {
    return {
      result: jsonService.diffString(fromFiltered, toFiltered),
      entries: [fromEntry, toEntry]
    };
  }
};
