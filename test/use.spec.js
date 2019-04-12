'use strict';

const ts = require('./util/testService');
const v = require('./util/values');

const { MODE = 'module' } = process.env;

/* -------------------------------------------------------------------------- *
 * USE command
 *
 * Note: general effects, i.e. setting the apiId, envId, and grantType for
 * the subsequent request, are comprehensively tested by the get/post/put/del
 * command tests.
 * -------------------------------------------------------------------------- */

describe(`USE (${MODE} mode)`, () => {

  describe('When providing values in arbitrary order', () => {

    let error, authRequest, apiRequest;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, requests: [authRequest, apiRequest] } = await ts.run(`use cc local foo; get ${v.REQ_PATH}`));
      }
      else {
        ({ error, requests: [authRequest, apiRequest] } = await ts.run((clappy) => {
          return clappy
            .use('cc', 'local', 'foo')
            .get(v.REQ_PATH);
        }));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should make the proper auth request', () => {
      const expected = ts.authRequestMatcher('foo', 'local', 'cc');
      expect(authRequest).toMatchObject(expected);
    });

    test('It should make the proper api request', () => {
      const expected = ts.apiRequestMatcher('foo', 'local', 'cc', 'get');
      expect(apiRequest).toMatchObject(expected);
    });
  });

  describe('When apiId is not defined and not provided', () => {

    let error, resolved;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, resolved } = await ts.run('use local cc'));
      }
      else {
        ({ error, resolved } = await ts.run((clappy) => {
          return clappy.use('local', 'cc');
        }));
      }
    });

    test('It should error', () => {
      expect(error).not.toBe(null);
    });
  });

  describe('When envId is not defined and not provided', () => {

    let error, resolved;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, resolved } = await ts.run('use foo cc'));
      }
      else {
        ({ error, resolved } = await ts.run((clappy) => {
          return clappy.use('foo', 'cc');
        }));
      }
    });

    test('It should error', () => {
      expect(error).not.toBe(null);
    });
  });

  describe('When grantType is not provided', () => {

    test('It should not error', async () => {
      const testFn = async (api) => {
        if (MODE === 'static') {
          return ts.run(`use local ${api}`);
        }
        else {
          return ts.run(clappy => clappy.use('local', api));
        }
      };
      const { error: fooError } = await testFn('foo');
      expect(fooError).toBe(null);
      const { error: barError } = await testFn('bar');
      expect(barError).toBe(null);
    });

    test('It should default to the first supported grantType', async () => {
      const testFn = async (api) => {
        if (MODE === 'static') {
          return ts.run(`use local ${api}; get ${v.REQ_PATH}`);
        }
        else {
          return ts.run(clappy => {
            return clappy
              .use('local', api)
              .get(v.REQ_PATH);
          });
        }
      };
      // Foo API's first grantType is client_credentials
      const { requests: [fooAuthRequest] } = await testFn('foo');
      expect(fooAuthRequest.body.grant_type).toBe('client_credentials');
      // Bar API's first grantType is password
      const { requests: [barAuthRequest] } = await testFn('bar');
      expect(barAuthRequest.body.grant_type).toBe('password');
    });
  });

  describe('When transitioning to a supported configuration', () => {

    const transitions = [{
      start  : ['foo', 'local', 'cc'],
      change : ['bar'],
      final  : ['bar', 'local', 'cc']
    }, {
      start  : ['foo', 'local', 'cc'],
      change : ['staging'],
      final  : ['foo', 'staging', 'cc']
    }, {
      start  : ['foo', 'local', 'cc'],
      change : ['pw'],
      final  : ['foo', 'local', 'pw']
    }, {
      start  : ['foo', 'local', 'cc'],
      change : ['bar', 'int'],
      final  : ['bar', 'int', 'cc']
    }, {
      start  : ['foo', 'local', 'cc'],
      change : ['bar', 'pw'],
      final  : ['bar', 'local', 'pw']
    }, {
      start  : ['foo', 'local', 'cc'],
      change : ['prod', 'pw'],
      final  : ['foo', 'prod', 'pw']
    }, {
      start  : ['foo', 'local', 'cc'],
      change : ['bar', 'int', 'pw'],
      final  : ['bar', 'int', 'pw']
    }, {
      start  : ['foo', 'local', 'cc'],
      change : ['foo', 'local', 'cc'],
      final  : ['foo', 'local', 'cc']
    }];

    const testFn = async (oldValues, newValues) => {
      if (MODE === 'static') {
        return ts.run(`use ${oldValues.join(' ')}; use ${newValues.join(' ')}; get ${v.REQ_PATH}`);
      }
      else {
        return ts.run((clappy) => {
          return clappy
            .use(...oldValues)
            .use(...newValues)
            .get(v.REQ_PATH);
        });
      }
    };

    transitions.forEach(({ start, change, final }) => {

      let error, authRequest, apiRequest;

      beforeAll(async () => {
        ({ error, requests: [authRequest, apiRequest] } = await testFn(start, change));
      });

      test('It should not error', () => {
        expect(error).toBe(null);
      });

      test('It should make the proper auth request', () => {
        expect(authRequest).toMatchObject(ts.authRequestMatcher(...final));
      });

      test('It should make the proper api request', () => {
        expect(apiRequest).toMatchObject(ts.apiRequestMatcher(...final, 'get'));
      });
    });
  });

  describe('When transitioning to an unsupported configuration', () => {

    const transitions = [{
      // Unsupported envId
      start  : ['foo', 'local', 'cc'],
      change : ['int']
    }, {
      // Unsupported envId for different apiId
      start  : ['foo', 'local', 'cc'],
      change : ['bar', 'staging']
    }, {
      // Unrecognized arg
      start  : ['foo', 'local', 'cc'],
      change : ['foo', 'local', 'qux']
    }];

    const testFn = async (oldValues, newValues) => {
      if (MODE === 'static') {
        return ts.run(`use ${oldValues.join(' ')}; use ${newValues.join(' ')}; get ${v.REQ_PATH}`);
      }
      else {
        return ts.run((clappy) => {
          return clappy
            .use(...oldValues)
            .use(...newValues)
            .get(v.REQ_PATH);
        });
      }
    };

    transitions.forEach(({ start, change }) => {

      let error, requests;

      beforeAll(async () => {
        ({ error, requests } = await testFn(start, change));
      });

      test('It should error', () => {
        expect(error).not.toBe(null);
      });

      test('It should not make any requests', () => {
        expect(requests.length).toBe(0);
      });
    });
  });
});
