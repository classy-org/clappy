'use strict';

const ts = require('./util/testService');
const v = require('./util/values');

const { MODE = 'module' } = process.env;

/* -------------------------------------------------------------------------- *
 * NEXT command
 * -------------------------------------------------------------------------- */

describe(`NEXT (${MODE} mode)`, () => {

  describe('When no requests have been made', () => {

    let error;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error } = await ts.run([
          `use foo local cc`,
          `next`
        ].join('; ')));
      }
      else {
        ({ error } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .next()
        ));
      }
    });

    test('It should error', () => {
      expect(error).not.toBe(null);
    });
  });

  describe('When latest transaction is focused', () => {

    let error;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `next`
        ].join('; ')));
      }
      else {
        ({ error } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .next()
        ));
      }
    });

    test('It should error', () => {
      expect(error).not.toBe(null);
    });
  });

  describe('When a transaction other than the latest is focused', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `prev`,
          `next`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .prev()
          .next()
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should focus the next request', () => {
      expect(response.query).toBe('req=B');
    });
  });
});
