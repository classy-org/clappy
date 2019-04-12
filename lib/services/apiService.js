'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');
const Credstash = require('credstash');
const state = require('../state');
const ttyService = require('./ttyService');

/* -------------------------------------------------------------------------- *
 * apiService
 *
 * Manages interaction with API state data.
 * -------------------------------------------------------------------------- */

class APIService {

  async get (key) {
    let value;
    const { apiId, envId } = state;
    const cached = getCurrent('cache', key);
    const definition = getCurrent('definition', key);
    if (cached) {
      return cached;
    }
    else if (!definition) {
      throw new Error(`${apiId} has no definition for "${key}" in ${envId} environment.`);
    }
    else if (typeof definition !== 'object') {
      value = definition;
    }
    else if (definition.source === 'credstash') {
      const { key: csKey, table, region, profile } = definition;
      AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile });
      AWS.config.update({ region });
      value = await new Promise((resolve, reject) => {
        const cs = new Credstash({ table });
        cs.get(csKey, (err, value) => {
          err ? reject(err) : resolve(value);
        });
      });
    }
    else if (definition.source === 'prompt') {
      if (state.context.mode !== 'client') {
        throw new Error(`${apiId} has no value assigned for "${key}" in ${envId} environment.`);
      }
      value = await ttyService.ask(definition);
    }
    else {
      throw new Error(`${apiId} has an invalid definition for "${key}" in ${envId} environment.`)
    }
    setCurrent('cache', key, value);
    return value;
  }

  getToken () {
    const token = getCurrent('token', state.grantType);
    if (!token || token.expires < Date.now() + 30000) {
      return null;
    }
    return token;
  }

  fromBaseUrl (baseUrl) {
    for (let apiId in state.apis) {
      for (let envId in state.apis[apiId].definitions) {
        if (baseUrl.toLowerCase() === state.apis[apiId].definitions[envId].baseUrl.toLowerCase()) {
          return { apiId, envId };
        }
      }
    }
    return {};
  }

  setToken ({ access_token, expires_in }) {
    const token = {
      value: access_token,
      expires: Date.now() + ((expires_in - 300) * 1000)
    };
    setCurrent('token', state.grantType, token);
    return token;
  }

  supportsEnv (apiId, envId) {
    return _(state.apis[apiId].definitions).keys().includes(envId);
  }

  supportsGrantType (apiId, grantType) {
    return state.apis[apiId].grantTypes.includes(grantType);
  }

  defaultGrantType (apiId) {
    return state.apis[apiId].grantTypes[0];
  }

  decorate (apiId, payloadType, payload) {
    const fn = payloadType === 'request'
      ? state.apis[apiId].decorateRequest
      : state.apis[apiId].decorateResponse;
    return _.isFunction(fn) ? fn(payload, this.get) : payload;
  }

  envIds () {
    return _(state.apis)
      .map('definitions')
      .map(Object.keys)
      .flatten()
      .uniq()
      .value();
  }

  apiIds () {
    return Object.keys(state.apis);
  }
}

function getCurrent (type, key) {
  const { apiId, envId } = state;
  const collection = (
      type === 'cache' ? _.get(state, ['apiCache', apiId, envId])
    : type === 'token' ? _.get(state, ['apiTokens', apiId, envId])
    : type === 'definition' ? _.get(state, ['apis', apiId, 'definitions', envId])
    : undefined
  );
  return _.get(collection, key);
}

function setCurrent (type, key, value) {
  const { apiId, envId } = state;
  const pathArr = (
      type === 'cache' ? ['apiCache', apiId, envId]
    : type === 'token' ? ['apiTokens', apiId, envId]
    : type === 'definition' ? ['apis', apiId, 'definitions', envId]
    : []
  );
  if (!_.get(state, pathArr)) _.set(state, pathArr, {});
  return _.set(state, [...pathArr, key], value);
}

module.exports = new APIService();
