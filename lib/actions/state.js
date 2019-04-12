'use strict';

const _ = require('lodash');
const parseArgs = require('../util/parseArgs');
const state = require('../state');

module.exports = async function stateAction (...args) {

  const {
    apiId = state.apiId,
    envId = state.envId,
    collection,
    objValue,
    path,
    genericValue
  } = parseArgs(args, {
    _: ['path', 'genericValue'],
    apiId: ['apiId'],
    envId: ['envId'],
    obj: ['objValue'],
    pick: { collection: ['definition', 'token'] }
  });

  const value = objValue || genericValue;

  const isDefinition = collection === 'definition';
  const isToken = collection === 'token';
  let destination = (
      isDefinition ? _.get(state, ['apis', apiId, 'definitions', envId])
    : isToken ? _.get(state, ['apiTokens', apiId, envId])
    : state
  );

  if (isToken && _.isUndefined(destination)) {
    destination = {};
    _.set(state, ['apiTokens', apiId, envId], destination);
  }

  if (_.isUndefined(path)) {
    return {
      result: destination
    };
  }

  if (_.isUndefined(value)) {
    return {
      result: _.get(destination, path)
    };
  }

  _.set(destination, path, value);

  return {
    notify: (
        _.isDefinition ? `Saved new ${path} definition for ${apiId} in ${envId} environment.`
      : _.isToken ? `Saved new ${path} token for ${apiId} in ${envId} environment.`
      : `Saved new value for ${path}`
    )
  };
};
