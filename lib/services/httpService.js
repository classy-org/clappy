'use strict';

const _ = require('lodash');
const apiService = require('./apiService');
const Cancellation = require('../factories/Cancellation');
const historyService = require('./historyService');
const mockService = require('./mockService');
const request = require('request-promise-native');
const state = require('../state');
const ttyService = require('./ttyService');

/* -------------------------------------------------------------------------- *
 * httpService
 *
 * Manages requests, including transparent requests for access tokens.
 * -------------------------------------------------------------------------- */

class HttpService {

  async createConfig (baseReq) {
    let token;
    if (state.dryRun) {
      token = mockService.token();
    }
    else if (apiService.getToken()) {
      token = apiService.getToken();
    }
    else {
      const isPassword = state.grantType === 'password';
      const tokenReq = await apiService.decorate(state.apiId, 'request', {
        method: 'POST',
        url: await apiService.get('authUrl'),
        body: {
          client_id: await apiService.get('clientId'),
          client_secret: await apiService.get('clientSecret'),
          username: isPassword ? await apiService.get('username') : undefined,
          password: isPassword ? await apiService.get('password') : undefined,
          grant_type: state.grantType
        },
        headers: {
          'User-Agent': 'Clappy API Client'
        },
        json: true
      });
      const fullTokenReq = _.merge({}, tokenReq, {
        resolveWithFullResponse: false,
        simple: true,
        strictSSL: false
      });
      const tokenResp = await request(fullTokenReq);
      token = apiService.setToken(tokenResp);
    }
    const req = _.merge(baseReq, {
      baseUrl: await apiService.get('baseUrl'),
      headers: {
        Authorization: `Bearer ${token.value}`,
        'User-Agent': 'Clappy API Client'
      },
      json: true
    });
    return await apiService.decorate(state.apiId, 'request', req);
  }

  async submitConfig (req) {
    const finalReq = _.merge({}, req, {
      resolveWithFullResponse: true,
      simple: false,
      strictSSL: false
    });
    await this.validate(finalReq);
    const res = state.dryRun
      ? mockService.response(finalReq)
      : await request(finalReq).then(r => r.toJSON());
    // Decorate response.
    // We cannot trust state.apiId, as we may be repeating an earlier request.
    const decorationApiId = apiService.fromBaseUrl(finalReq.baseUrl).apiId;
    const finalRes = decorationApiId
      ? await apiService.decorate(decorationApiId, 'response', res)
      : res;
    return historyService.logTransaction(finalReq, finalRes);
  }

  async validate (finalReq) {
    // Ignore if not using the "prod" environment.
    // We cannot trust state.envId, as we may be repeating an earlier request.
    if (apiService.fromBaseUrl(finalReq.baseUrl).envId !== 'prod') {
      return;
    }
    // Ignore if request is unlikely to modify state.
    if (['get', 'options'].includes(finalReq.method.toLowerCase())) {
      return;
    }
    // Ignore if user has specifically enabled prod modification.
    if (state.enableProdModifications) {
      return;
    }
    // Ignore if this is a dry run.
    if (state.dryRun) {
      return;
    }
    // Fail out if the user is unable to interactively authorize the request.
    if (state.context.mode !== 'client') {
      throw new Error([
        'Production resource modifications are disabled by default. Please run',
        'again with the --prod flag.'
      ].join(' '));
    }
    // Ask user for authorization.
    switch (await ttyService.askToModifyProd()) {
      case 'cancel':
        throw new Cancellation('Request canceled.');
      case 'continue':
        return;
      case 'silence':
        state.enableProdModifications = true;
        return;
    }
  }

};

module.exports = new HttpService();
