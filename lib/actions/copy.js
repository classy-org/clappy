'use strict';

const _ = require('lodash');
const clipboardy = require('clipboardy');
const historyService = require('../services/historyService');
const jsonService = require('../services/jsonService');
const parseArgs = require('../util/parseArgs');

module.exports = async function copyAction (...args) {

  if (historyService.isEmpty) {
    throw new Error('Nothing to copy; please make a transaction first.');
  }

  const {
    filter,
    full: isFull,
    txnId = historyService.resolve('current')
  } = parseArgs(args, {
    _: ['filter'],
    flag: ['full'],
    txnId: ['txnId']
  });

  const entry = historyService.get(txnId);

  const output = await jsonService.filter(entry, isFull, filter);

  if (filter) historyService.logFilter(filter);

  clipboardy.writeSync(JSON.stringify(output, null, 2));

  return {
    notify: 'Copied to clipboard.'
  };
};
