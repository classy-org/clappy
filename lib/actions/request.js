'use strict';

const _ = require('lodash');
const httpService = require('../services/httpService');
const parseArgs = require('../util/parseArgs');
const parseRoute = require('../util/parseRoute');
const state = require('../state');
const ttyService = require('../services/ttyService');

module.exports = async function requestAction (...args) {

  if (state.context.mode !== 'client') {
    throw new Error('This command is only available in client mode.');
  }

  if (!state.apiId || !state.envId) {
    throw new Error('Please select an api and env first.');
  }

  const {
    body,
    method,
    route
  } = parseArgs(args, {
    _: ['route'],
    obj: ['body'],
    pick: { method: ['get', 'post', 'put', 'delete'] }
  });

  const routeData = route ? parseRoute(route) : { url: null, qs: null };

  const baseConfig = await httpService.createConfig({
    body,
    method,
    ...routeData
  });
  const baseConfigStr = JSON.stringify(baseConfig, null, 2);
  const config = await ttyService.askForJson('Edit request config:', baseConfigStr);
  const entry = await httpService.submitConfig(config);

  return {
    result: entry.response.body,
    entries: [entry]
  };
};
