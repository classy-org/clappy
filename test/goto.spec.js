'use strict';

const ts = require('./util/testService');
const v = require('./util/values');

const { MODE = 'module' } = process.env;

/* -------------------------------------------------------------------------- *
 * GOTO command
 * -------------------------------------------------------------------------- */

describe(`GOTO (${MODE} mode)`, () => {

  describe('When no transactions have been made', () => {

    let error;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error } = await ts.run([
          `use foo local cc`,
          `goto 1`
        ].join('; ')));
      }
      else {
        ({ error } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .goto(1)
        ));
      }
    });

    test('It should error', () => {
      expect(error).not.toBe(null);
    });
  });

  describe('When using a transaction index', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `goto 1`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .goto(1)
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should focus the request referenced', () => {
      expect(response.query).toBe('req=A');
    });
  });

  describe('When using prev', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `goto prev`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .goto('prev')
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should focus the previous request', () => {
      expect(response.query).toBe('req=B');
    });
  });

  describe('When using next', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `prev`,
          `goto next`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .prev()
          .goto('next')
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should focus the next request', () => {
      expect(response.query).toBe('req=C');
    });
  });

  describe('When using latest', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `prev`,
          `goto latest`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .prev()
          .goto('latest')
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should focus the latest request', () => {
      expect(response.query).toBe('req=C');
    });
  });

  describe('When using current', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `prev`,
          `goto current`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .prev()
          .goto('current')
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should not change focus', () => {
      expect(response.query).toBe('req=B');
    });
  });

  describe('When using a negative number', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `goto -1`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .goto('-1')
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should focus the nth most recent request', () => {
      expect(response.query).toBe('req=B');
    });
  });

  describe('When using a transaction alias', () => {

    let error, response;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error, response } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `alias transaction reqA`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `goto reqA`,
          `inspect full .request.uri`
        ].join('; ')));
        response = JSON.parse(response);
      }
      else {
        ({ error, response } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .alias('transaction', 'reqA')
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .goto('reqA')
          .inspect('full', '.request.uri')
        ));
      }
    });

    test('It should not error', () => {
      expect(error).toBe(null);
    });

    test('It should focus the aliased transaction', () => {
      expect(response.query).toBe('req=A');
    });
  });

  describe('When not providing a transaction descriptor in non-interactive mode', () => {

    let error;

    beforeAll(async () => {
      if (MODE === 'static') {
        ({ error } = await ts.run([
          `use foo local cc`,
          `get ${v.REQ_PATH_ROOT}?req=A`,
          `get ${v.REQ_PATH_ROOT}?req=B`,
          `get ${v.REQ_PATH_ROOT}?req=C`,
          `goto`
        ].join('; ')));
      }
      else {
        ({ error } = await ts.run((clappy) => clappy
          .use('cc', 'local', 'foo')
          .get(`${v.REQ_PATH_ROOT}?req=A`)
          .alias('transaction', 'reqA')
          .get(`${v.REQ_PATH_ROOT}?req=B`)
          .get(`${v.REQ_PATH_ROOT}?req=C`)
          .goto()
        ));
      }
    });

    test('It should error', () => {
      expect(error).not.toBe(null);
    });
  });
});
