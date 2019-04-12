'use strict';

const _ = require('lodash');
const historyService = require('../services/historyService');
const httpService = require('../services/httpService');
const parseArgs = require('../util/parseArgs');

module.exports = async function repeatAction (...args) {

  if (historyService.isEmpty) {
    throw new Error('Nothing to repeat; please make a transaction first.');
  }

  const {
    txnId = historyService.resolve()
  } = parseArgs(args, {
    txnId: ['txnId']
  });

  const pastEntry = historyService.get(txnId);
  const config = pastEntry.request;

  const entry = await httpService.submitConfig(config);

  return {
    result: entry.response.body,
    entries: [entry]
  };
};
