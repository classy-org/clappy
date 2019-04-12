'use strict';

const _ = require('lodash');
const path = require('path');

/* -------------------------------------------------------------------------- *
 * mockService
 *
 * Manages dry run response mocking.
 * -------------------------------------------------------------------------- */

class MockService {

  response (reqConfig) {
    return {
      statusCode: 200,
      body: {
        mock: 'response',
        for: `${reqConfig.method.toUpperCase()} ${reqConfig.url || reqConfig.uri}`
      },
      headers: {
        server: 'nginx/1.12.1',
        date: (new Date()).toUTCString(),
        'content-type': 'application/json; charset=utf-8',
        'content-length': `${(JSON.stringify(reqConfig.body) || '').length}`,
        connection: 'close',
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        vary: 'Accept-Encoding'
      },
      request: {
        method: reqConfig.method,
        headers: reqConfig.headers,
        uri: {
          href: `${reqConfig.baseUrl}/${_.trim(reqConfig.url || reqConfig.uri, '/')}`
        }
      },
      requestConfig: reqConfig
    }
  }

  token () {
    return {
      value: 'MOCK_TOKEN',
      expires: Date.now() + 3600000
    }
  }

}

module.exports = new MockService();
