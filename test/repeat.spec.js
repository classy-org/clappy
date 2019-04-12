'use strict';

const ts = require('./util/testService');
const v = require('./util/values');

const { MODE = 'module' } = process.env;


/* -------------------------------------------------------------------------- *
 * REPEAT command
 * -------------------------------------------------------------------------- */

describe(`REPEAT (${MODE} mode)`, () => {

  describe('General behavior', () => {

    let error, requests, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, requests, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH}`,
          `repeat`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, requests, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(v.REQ_PATH)
          .repeat()
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should make three requests', () => {
      expect(requests.length).toBe(3);
    });

    test('It should make the proper auth request', () => {
      const expected = ts.authRequestMatcher('foo', 'local', 'cc');
      expect(requests[0]).toMatchObject(expected);
    });

    test('It should make the same api request twice', () => {
      const expected = ts.apiRequestMatcher('foo', 'local', 'cc', 'get');
      expect(requests[1]).toMatchObject(expected);
      expect(requests[2]).toMatchObject(expected);
    });

    test('It should produce the response body', () => {
      expect(response).toEqual({ mock: 'response', for: 'GET' });
    });
  });

  describe('When token expires between requests', () => {

    let error, requests, response;

    beforeAll(async () => {
      const pastExpiration = Date.now() - 1000;
      if (MODE === 'static') {
        ({ error, requests, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH}`,
          `state token client_credentials.expires ${pastExpiration}`,
          `repeat`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, requests, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(v.REQ_PATH)
          .state('token', 'client_credentials.expires', pastExpiration)
          .repeat()
        ));
      }
    });

    test('It should still not error', () => {
      expect(error).toBe(null);
    });

    test('It should still make three requests', () => {
      expect(requests.length).toBe(3);
    });

    test('It should still make the proper auth request', () => {
      const expected = ts.authRequestMatcher('foo', 'local', 'cc');
      expect(requests[0]).toMatchObject(expected);
    });

    test('It should still make the same api request twice', () => {
      const expected = ts.apiRequestMatcher('foo', 'local', 'cc', 'get');
      expect(requests[1]).toMatchObject(expected);
      expect(requests[2]).toMatchObject(expected);
    });

    test('It should still produce the response body', () => {
      expect(response).toEqual({ mock: 'response', for: 'GET' });
    });
  });

  describe('When apiId, envId, and/or token have been changed', () => {

    let error, requests, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, requests, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH}`,
          `use bar prod pw`,
          `repeat`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, requests, response } = await ts.run((clappy) => clappy
          .use('foo', 'local', 'cc')
          .get(v.REQ_PATH)
          .use('bar', 'prod', 'pw')
          .repeat()
        ));
      }
    });

    test('It should still not error', () => {
      expect(error).toBe(null);
    });

    test('It should still make three requests', () => {
      expect(requests.length).toBe(3);
    });

    test('It should still make the proper auth request', () => {
      const expected = ts.authRequestMatcher('foo', 'local', 'cc');
      expect(requests[0]).toMatchObject(expected);
    });

    test('It should still make the same api request twice', () => {
      const expected = ts.apiRequestMatcher('foo', 'local', 'cc', 'get');
      expect(requests[1]).toMatchObject(expected);
      expect(requests[2]).toMatchObject(expected);
    });

    test('It should still produce the response body', () => {
      expect(response).toEqual({ mock: 'response', for: 'GET' });
    });
  });

  describe('When original request was against prod and enableProdModifications has since been disabled', () => {

    let error, requests;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, requests } = await ts.run([
          `use foo prod cc`,
          `state enableProdModifications true`,
          `post ${v.REQ_PATH} ${JSON.stringify(v.REQ_BODY)}`,
          `state enableProdModifications false`,
          `use bar local pw`,
          `repeat`
        ].join('; ')));
      }
      else {
        ({ error, requests } = await ts.run((clappy) => clappy
          .use('foo', 'prod', 'cc')
          .state('enableProdModifications', true)
          .post(v.REQ_PATH, v.REQ_BODY)
          .state('enableProdModifications', false)
          .use('bar', 'local', 'pw')
          .repeat()
        ));
      }
    });

    test('It should error', () => {
      expect(error).not.toBe(null);
    });

    test('It should only make two requests', () => {
      expect(requests.length).toBe(2);
    });

    test('It should still make the proper auth request', () => {
      const expected = ts.authRequestMatcher('foo', 'prod', 'cc');
      expect(requests[0]).toMatchObject(expected);
    });

    test('It should only make the api request once', () => {
      const expected = ts.apiRequestMatcher('foo', 'prod', 'cc', 'post');
      expect(requests[1]).toMatchObject(expected);
    });
  });
});
