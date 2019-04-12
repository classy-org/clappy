'use strict';

const historyService = require('../services/historyService');

module.exports = async function nextAction () {

  if (historyService.isEmpty) {
    throw new Error('Please make a transaction first.');
  }

  if (historyService.atLatest) {
    throw new Error('You are already at the latest transaction.');
  }

  const txnId = historyService.resolve('next');
  const entry = historyService.get(txnId);
  const slug = historyService.transactionSlug(entry);

  historyService.go(txnId);

  return {
    notify: `Now at: ${slug}.`,
    entries: [entry]
  };
};
