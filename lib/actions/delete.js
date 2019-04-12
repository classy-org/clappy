'use strict';

const httpService = require('../services/httpService');
const parseArgs = require('../util/parseArgs');
const parseRoute = require('../util/parseRoute');
const state = require('../state');

module.exports = async function deleteAction (...args) {
  
  if (!state.apiId || !state.envId) {
    throw new Error('Please select an api and env first.');
  }

  const { route } = parseArgs(args, { _: ['route'] });

  if (!route) {
    throw new Error('Please provide a valid endpoint.');
  }

  const config = await httpService.createConfig({
    method: 'DELETE',
    ...parseRoute(route)
  });

  const entry = await httpService.submitConfig(config);

  return {
    result: entry.response.body,
    entries: [entry],
  };
};
