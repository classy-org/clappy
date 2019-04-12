'use strict';

const ts = require('./util/testService');
const v = require('./util/values');

const { MODE = 'module' } = process.env;

describe(`GET (${MODE} mode)`, () => {

  describe('Cross-environment request checks', () => {

    ts.forEach((apiId, envId, grantType, prefix) => {

      let requests, response;

      beforeAll(async () => {
        if (MODE === 'static') {
          ({ requests, response } = await ts.run(
            `use ${apiId} ${envId} ${grantType}; get ${v.REQ_PATH}`
          ));
          response = JSON.parse(response);
        }
        else {
          ({ requests, response } = await ts.run((clappy) => {
            return clappy
              .use(apiId, envId, grantType)
              .get(v.REQ_PATH);
          }));
        }
      });

      test(`${prefix} Check auth request`, () => {
        const authRequest = requests[0];
        const expected = ts.authRequestMatcher(apiId, envId, grantType);
        expect(authRequest).toMatchObject(expected);
      });

      test(`${prefix} Check API request`, () => {
        const apiRequest = requests[1];
        const expected = ts.apiRequestMatcher(apiId, envId, grantType, 'get');
        expect(apiRequest).toMatchObject(expected);
      });

      test(`${prefix} Check Clappy response`, () => {
        expect(response).toEqual({ mock: 'response', for: 'GET' });
      });

    });
  });

  describe('When dryRun is true', () => {

    let requests, resolved, error;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ requests, resolved, error } = await ts.run(
          `use foo prod cc; state dryRun true; get ${v.REQ_PATH}`
        ));
      }
      else {
        ({ requests, resolved, error } = await ts.run((clappy) => {
          return clappy
            .use('foo', 'prod', 'cc')
            .state('dryRun', true)
            .get(v.REQ_PATH);
        }));
      }
    });

    test('It should not error', () => {
      expect(resolved).toBe(true);
      expect(error).toBe(null);
    });

    test('It should not send any requests', () => {
      expect(requests.length).toBe(0);
    });
  });

  describe('When a cached token exists', () => {

    let requests;

    beforeAll(async () => {
      const expiration = Date.now() + 3600000;
      if (MODE === 'static') {
        ({ requests } = await ts.run(
          `use local foo cc; state token client_credentials.value "TEST_TOKEN"; state token client_credentials.expires ${expiration}; get ${v.REQ_PATH}`
        ));
      }
      else {
        ({ requests } = await ts.run((clappy) => {
          return clappy
            .use('local', 'foo', 'cc')
            .state('token', 'client_credentials', {
              value: 'TEST_TOKEN',
              expires: expiration
            })
            .get(v.REQ_PATH);
        }));
      }
    });

    test('It should make only one request', () => {
      expect(requests.length).toBe(1);
    });

    test('It should use the stored token', () => {
      expect(requests[0].headers.authorization).toBe('Bearer TEST_TOKEN');
    });
  });

  describe('When cached token expires within 30 seconds', () => {

    let requests;

    beforeAll(async () => {
      const expiration = Date.now() + 29000;
      if (MODE === 'static') {
        ({ requests } = await ts.run(
          `use local foo cc; state token client_credentials.value "TEST_TOKEN"; state token client_credentials.expires ${expiration}; get ${v.REQ_PATH}`
        ));
      }
      else {
        ({ requests } = await ts.run((clappy) => {
          return clappy
            .use('local', 'foo', 'cc')
            .state('token', 'client_credentials', {
              value: 'TEST_TOKEN',
              expires: expiration
            })
            .get(v.REQ_PATH);
        }));
      }
    });

    test('It should make two requests', () => {
      expect(requests.length).toBe(2);
    });

    test('It should request a new token', () => {
      const authRequest = requests[0];
      const expected = ts.authRequestMatcher('foo', 'local', 'cc');
      expect(authRequest).toMatchObject(expected);
    });

    test('It should use the new token for the request', () => {
      const apiRequest = requests[1];
      const token = v.get('foo', 'local', 'CC_TOKEN');
      expect(apiRequest.headers.authorization).toBe(`Bearer ${token}`);
    });
  });
});
