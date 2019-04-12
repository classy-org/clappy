'use strict';

const historyService = require('../services/historyService');
const parseArgs = require('../util/parseArgs');
const state = require('../state');
const ttyService = require('../services/ttyService');

module.exports = async function gotoAction (...args) {

  if (historyService.isEmpty) {
    throw new Error('Nowhere to go; please make a transaction first.');
  }

  let { txnId } = parseArgs(args, { txnId: ['txnId'] });

  if (!txnId) {
    if (state.context.mode !== 'client') {
      throw new Error('Please provide a transaction descriptor.');
    } else {
      txnId = await ttyService.askForEntry('Select a transaction to review:');
    }
  }

  const entry = historyService.get(txnId);
  const slug = historyService.transactionSlug(entry);

  historyService.go(txnId);

  return {
    notify: `Now at: ${slug}.`,
    entries: [entry]
  };
};
