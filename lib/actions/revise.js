'use strict';

const _ = require('lodash');
const historyService = require('../services/historyService');
const httpService = require('../services/httpService');
const parseArgs = require('../util/parseArgs');
const ttyService = require('../services/ttyService');
const state = require('../state');

module.exports = async function reviseAction (...args) {

  if (state.context.mode !== 'client') {
    throw new Error('This command is only available in client mode.');
  }

  if (historyService.isEmpty) {
    throw new Error('Nothing to revise; please make a transaction first.');
  }

  const {
    txnId = historyService.resolve('current')
  } = parseArgs(args, {
    txnId: ['txnId']
  });

  const fullConfig = historyService.get(txnId).request;
  const baseConfig = _.omit(fullConfig, [
    'json',
    'resolveWithFullResponse',
    'simple',
    'strictSSL',
    'time',
  ]);
  const baseConfigStr = JSON.stringify(baseConfig, null, 2);
  const config = await ttyService.askForJson('Edit request config:', baseConfigStr);

  const entry = await httpService.submitConfig(config);

  return {
    result: entry.response.body,
    entries: [entry]
  };
};
