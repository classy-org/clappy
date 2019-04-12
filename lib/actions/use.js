'use strict';

const apiService = require('../services/apiService');
const parseArgs = require('../util/parseArgs');
const state = require('../state');

module.exports = async function useAction (...args) {

  const {
    apiId = state.apiId,
    envId = state.envId,
    grantType = state.grantType || apiService.defaultGrantType(apiId),
    extraneous
  } = parseArgs(args, {
    apiId: ['apiId'],
    envId: ['envId'],
    grantType: ['grantType'],
    _: ['extraneous']
  });

  if (extraneous) {
    throw new Error(`${extraneous} is not a valid API, environment, or grant type.`);
  }

  if (!state.apiId && !state.envId && (!apiId || !envId)) {
    throw new Error('Please provide a valid API and environment.');
  }

  if (!apiService.supportsEnv(apiId, envId)) {
    throw new Error(`${apiId} does not support ${envId} environment.`);
  }

  if (!apiService.supportsGrantType(apiId, grantType)) {
    throw new Error(`${apiId} does not support ${grantType} grant type.`)
  }

  if (envId === state.envId && apiId === state.apiId && grantType === state.grantType) {
    return {
      notify: `Already using ${apiId} with ${grantType} grant type in ${envId} environment.`
    };
  }

  state.envId = envId;
  state.apiId = apiId;
  state.grantType = grantType;

  return {
    notify: `Now using ${apiId} with ${grantType} grant type in ${envId} environment.`
  };
};
