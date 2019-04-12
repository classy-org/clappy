'use strict';

const state = require('../state');

module.exports = async function exitAction () {
  if (state.context.mode !== 'client') {
    throw new Error('This command is only available in client mode.');
  }
  process.exit();
};
