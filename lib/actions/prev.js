'use strict';

const historyService = require('../services/historyService');

module.exports = async function prevAction () {

  if (historyService.isEmpty) {
    throw new Error('Please make a transaction first.');
  }

  if (historyService.atFirst) {
    throw new Error('You are already at the first transaction.');
  }

  const txnId = historyService.resolve('prev');
  const entry = historyService.get(txnId);
  const slug = historyService.transactionSlug(entry);

  historyService.go(txnId);

  return {
    notify: `Now at: ${slug}.`,
    entries: [entry]
  };
};
