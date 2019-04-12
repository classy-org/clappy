'use strict';

const state = require('../state');

module.exports = async function clearAction () {
  if (state.context.mode !== 'client') {
    throw new Error('This command is only available in client mode.');
  }
  console.clear();
  return {};
};
