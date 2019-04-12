'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const v = require('./values');

const log = {};
let server;


/* -------------------------------------------------------------------------- *
 * Test server
 *
 * Local server used by Clappy test instances as an api, and by the tests
 * themselves to retrieve request histories.
 * -------------------------------------------------------------------------- */

module.exports = {

  async up () {
    const app = express();
    app.use(bodyParser.json());
    app.get('/history/:instId', createHistoryHandler());
    app.use('/foo/local', createTestRouter('foo', 'local'));
    app.use('/foo/staging', createTestRouter('foo', 'staging'));
    app.use('/foo/prod', createTestRouter('foo', 'prod'));
    app.use('/bar/local', createTestRouter('bar', 'local'));
    app.use('/bar/int', createTestRouter('bar', 'int'));
    app.use('/bar/prod', createTestRouter('bar', 'prod'));
    server = app.listen(7357);
  },

  async down () {
    server.close();
  }
};

/* -------------------------------------------------------------------------- *
 * createHistoryHandler - /inspect/{instId}
 *
 * Retrieve the log of requests made by a particular Clappy test instance.
 * -------------------------------------------------------------------------- */

function createHistoryHandler () {
  return (req, res, next) => {
    const { instId } = req.params;
    const requests = _.get(log, instId, []);
    _.unset(log, instId);
    res.status(200).json(requests);
  };
}


/* -------------------------------------------------------------------------- *
 * createTestRouter - /{apiId}/{envId}/*
 *
 * Create a router for a particular test api/env combination.
 * -------------------------------------------------------------------------- */

function createTestRouter (apiId, envId) {

  const router = new express.Router();

  // Log all requests
  router
    .use((req, res, next) => {
      const instId = req.get('x-clappy-uuid');
      if (!instId) {
        throw new Error('Test requests must include an x-clappy-uuid header.');
      }
      const instLog = _.get(log, instId, []);
      instLog.push(_.pick(req, [
        'originalUrl',
        'method',
        'body',
        'headers'
      ]));
      _.set(log, instId, instLog);
      next();
    });

  // Auth requests
  router
    .route('/oauth2/auth')
    .post((req, res) => {
      const grantTypes = {
        client_credentials: 'cc',
        password: 'pw'
      };
      const grantType = grantTypes[req.body.grant_type];
      res.status(200).send({
        access_token: v.get(apiId, envId, `${grantType}_TOKEN`),
        expires_in: Date.now() + 3600000
      });
    });

  // API requests
  router
    .route(`/2.0/resource`)
    .all((req, res) => {
      res.status(200).send({
        mock: 'response',
        for: req.method.toUpperCase()
      });
    });

  return router;
}
