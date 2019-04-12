'use strict';

const httpService = require('../services/httpService');
const parseArgs = require('../util/parseArgs');
const parseRoute = require('../util/parseRoute');
const state = require('../state');
const ttyService = require('../services/ttyService');

module.exports = async function postAction (...args) {

  if (!state.apiId || !state.envId) {
    throw new Error('Please select an api and env first.');
  }

  let { body, route } = parseArgs(args, {
    _: ['route'],
    obj: ['body']
  });

  if (!route) {
    throw new Error('Please provide a valid endpoint.');
  }

  if (!body) {
    if (state.context.mode !== 'client') {
      throw new Error('Please provide a valid request body.');
    } else {
      body = await ttyService.askForJson('Enter request body:');
    }
  }

  const config = await httpService.createConfig({
    method: 'POST',
    body,
    ...parseRoute(route),
  });

  const entry = await httpService.submitConfig(config);

  return {
    result: entry.response.body,
    entries: [entry]
  };
};
